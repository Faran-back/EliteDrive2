import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export interface SqliteCollectionMap {
  [collectionName: string]: unknown;
}

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data.sqlite');

function ensureParentDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getCorruptBackupPath(dbPath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${dbPath}.corrupt.${timestamp}`;
}

function cleanupOldCorruptBackups(dbPath: string, keep = 5): void {
  const dir = path.dirname(dbPath);
  const baseName = path.basename(dbPath);
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
  return process.env.SQLITE_DB_PATH || DEFAULT_DB_PATH;
}

export function saveCollectionsToSqlite(collections: SqliteCollectionMap, dbPath = getSqliteDatabasePath()): boolean {
  ensureParentDir(dbPath);

  let db: Database | undefined;
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
    return true;
  } finally {
    db?.close();
  }
}

export function loadCollectionsFromSqlite(dbPath = getSqliteDatabasePath()): SqliteCollectionMap {
  if (!fs.existsSync(dbPath)) {
    return {};
  }

  let db: Database | undefined;
  try {
    try {
      db = new Database(dbPath, { readonly: true, fileMustExist: true });
    } catch (err: any) {
      if (isSqliteCorruptionError(err)) {
        backupCorruptedDatabase(dbPath);
        return {};
      }
      throw err;
    }

    const integrityRaw = db.pragma('integrity_check', { simple: true });
    const integrity = Array.isArray(integrityRaw) ? integrityRaw[0] : integrityRaw;
    if (integrity !== 'ok') {
      db.close();
      backupCorruptedDatabase(dbPath);
      return {};
    }

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
      db?.close();
      backupCorruptedDatabase(dbPath);
      return {};
    }
    throw err;
  } finally {
    db?.close();
  }
}
