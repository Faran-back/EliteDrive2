import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { db as centralDb, getActiveDatabasePath, syncDatabaseReplicas } from '../lib/db';

export interface SqliteCollectionMap {
  [collectionName: string]: unknown;
}

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data.sqlite');
const HOME_DB_PATH = path.join(os.homedir(), '.elitedrive_data.sqlite');
const TMP_DB_PATH = path.join('/tmp', 'elitedrive_data.sqlite');

function ensureParentDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function syncDatabaseFiles(targetPath: string) {
  const paths = [HOME_DB_PATH, TMP_DB_PATH, DEFAULT_DB_PATH];
  
  let bestPath: string | null = null;
  let bestMtime = 0;
  let bestSize = 0;

  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        const stats = fs.statSync(p);
        if (stats.size > 0 && stats.mtimeMs > bestMtime) {
          bestMtime = stats.mtimeMs;
          bestSize = stats.size;
          bestPath = p;
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  if (bestPath) {
    console.info(`[SQLite] Best persistent source database found at ${bestPath} (${bestSize} bytes, updated ${new Date(bestMtime).toISOString()})`);
    
    // Copy to target path if it's not the best path
    if (targetPath !== bestPath) {
      try {
        ensureParentDir(targetPath);
        fs.copyFileSync(bestPath, targetPath);
        console.info(`[SQLite] Restored/Synced database to target path: ${targetPath}`);
      } catch (err: any) {
        console.warn(`[SQLite] Warning: Could not write database sync to target: ${err.message}`);
      }
    }

    // Sync to all other paths too to maintain redudancy
    for (const p of paths) {
      if (p !== bestPath && p !== targetPath) {
        try {
          ensureParentDir(p);
          fs.copyFileSync(bestPath, p);
          console.info(`[SQLite] Replicated database copy to redundant persistent storage: ${p}`);
        } catch (e: any) {
          // Ignore
        }
      }
    }
  }
}

function getCorruptBackupPath(dbPath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${dbPath}.corrupt.${timestamp}`;
}

function cleanupOldCorruptBackups(dbPath: string, keep = 5): void {
  const dir = path.dirname(dbPath);
  const baseName = path.basename(dbPath);
  try {
    const corruptFiles = fs.readdirSync(dir)
      .filter((name) => name.startsWith(`${baseName}.corrupt.`))
      .map((name) => ({
        name,
        time: fs.statSync(path.join(dir, name)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    for (let i = keep; i < corruptFiles.length; i += 1) {
      const oldFile = path.join(dir, corruptFiles[i].name);
      try {
        fs.unlinkSync(oldFile);
        console.info(`[SQLite] Removed old corrupt backup file: ${oldFile}`);
      } catch (err) {
        console.error('[SQLite] Failed to remove old corrupt backup file:', err);
      }
    }
  } catch (e) {
    // Ignore readDir or stat errors
  }
}

function backupCorruptedDatabase(dbPath: string): void {
  if (!fs.existsSync(dbPath)) return;

  const backupPath = getCorruptBackupPath(dbPath);
  try {
    fs.renameSync(dbPath, backupPath);
    console.warn(`[SQLite] Corrupt database file moved to ${backupPath}`);
    cleanupOldCorruptBackups(dbPath);
  } catch (err) {
    console.error('[SQLite] Failed to back up corrupt database file:', err);
  }
}

function isSqliteCorruptionError(error: any): boolean {
  return error && (error.code === 'SQLITE_CORRUPT' || error.message?.includes('disk image is malformed'));
}

export function getSqliteDatabasePath(): string {
  return getActiveDatabasePath();
}

export function saveCollectionsToSqlite(collections: SqliteCollectionMap, dbPath = getSqliteDatabasePath()): boolean {
  const activePath = getActiveDatabasePath();
  const isDefaultDb = dbPath === activePath;

  // Use the central database instance directly for default path
  if (isDefaultDb) {
    try {
      const insert = centralDb.prepare(`
        INSERT INTO collections (name, data)
        VALUES (@name, @data)
        ON CONFLICT(name) DO UPDATE SET data = excluded.data;
      `);

      const transaction = centralDb.transaction((items: Array<{ name: string; data: string }>) => {
        for (const item of items) {
          insert.run(item);
        }
      });

      transaction(Object.entries(collections).map(([name, data]) => ({
        name,
        data: JSON.stringify(data),
      })));

      // Sync active DB changes to redundant persistent backups
      syncDatabaseReplicas();
      return true;
    } catch (err: any) {
      console.error('[SQLite Store] Failed to save using centralized connection:', err);
      // Fallback below to separate connection if needed
    }
  }

  // Fallback or Non-default database path (e.g. testing context)
  ensureParentDir(dbPath);
  let db: Database.Database | undefined;
  try {
    try {
      db = new Database(dbPath);
    } catch (err: any) {
      if (isSqliteCorruptionError(err)) {
        backupCorruptedDatabase(dbPath);
        db = new Database(dbPath);
      } else {
        throw err;
      }
    }

    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        name TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
    `);

    const insert = db.prepare(`
      INSERT INTO collections (name, data)
      VALUES (@name, @data)
      ON CONFLICT(name) DO UPDATE SET data = excluded.data;
    `);

    const transaction = db.transaction((items: Array<{ name: string; data: string }>) => {
      for (const item of items) {
        insert.run(item);
      }
    });

    transaction(Object.entries(collections).map(([name, data]) => ({
      name,
      data: JSON.stringify(data),
    })));

    db.close();
    db = undefined;

    // Redundant backups sync: copy saved db to other persistent areas if it was custom
    const paths = [HOME_DB_PATH, TMP_DB_PATH, DEFAULT_DB_PATH];
    for (const p of paths) {
      if (p !== dbPath) {
        try {
          ensureParentDir(p);
          fs.copyFileSync(dbPath, p);
        } catch (e: any) {
          // Silent catch to ensure main save works even if redundant writing is restricted
        }
      }
    }

    return true;
  } finally {
    if (db) {
      try {
        db.close();
      } catch (e) {}
    }
  }
}

export function loadCollectionsFromSqlite(dbPath = getSqliteDatabasePath()): SqliteCollectionMap {
  const activePath = getActiveDatabasePath();
  const isDefaultDb = dbPath === activePath;

  // Sync database files from best redundant storage before attempting to load
  syncDatabaseFiles(dbPath);

  if (isDefaultDb) {
    try {
      const rows = centralDb.prepare('SELECT name, data FROM collections').all() as Array<{ name: string; data: string }>;
      const result: SqliteCollectionMap = {};
      for (const row of rows) {
        result[row.name] = JSON.parse(row.data);
      }
      return result;
    } catch (err: any) {
      console.error('[SQLite Store] Failed to load using centralized connection:', err);
    }
  }

  if (!fs.existsSync(dbPath)) {
    return {};
  }

  let db: Database.Database | undefined;
  try {
    try {
      db = new Database(dbPath);
    } catch (err: any) {
      if (isSqliteCorruptionError(err)) {
        backupCorruptedDatabase(dbPath);
        return {};
      }
      throw err;
    }

    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        name TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
    `);

    const rows = db.prepare('SELECT name, data FROM collections').all() as Array<{ name: string; data: string }>;
    const result: SqliteCollectionMap = {};
    for (const row of rows) {
      result[row.name] = JSON.parse(row.data);
    }
    return result;
  } catch (err: any) {
    if (isSqliteCorruptionError(err)) {
      if (db) {
        try { db.close(); } catch (e) {}
      }
      backupCorruptedDatabase(dbPath);
      return {};
    }
    throw err;
  } finally {
    if (db) {
      try {
        db.close();
      } catch (e) {}
    }
  }
}

