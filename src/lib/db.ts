import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Configure persistent database file paths
const DEFAULT_DB_PATH = path.join(process.cwd(), 'data.sqlite');
const HOME_DB_PATH = path.join(os.homedir(), '.elitedrive_data.sqlite');
const TMP_DB_PATH = path.join('/tmp', 'elitedrive_data.sqlite');

function ensureParentDirectory(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Searches and synchronizes database files between the redundant storage paths.
 * Resolves the most up-to-date database file based on modification times and size.
 */
export function getActiveDatabasePath(): string {
  // Respect environmental override if present
  if (process.env.SQLITE_DB_PATH) {
    return process.env.SQLITE_DB_PATH;
  }

  const paths = [HOME_DB_PATH, TMP_DB_PATH, DEFAULT_DB_PATH];
  let bestPath = DEFAULT_DB_PATH;
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
      // Quietly ignore inaccessible or erroring paths
    }
  }

  // Ensure active database parent directory exists
  ensureParentDirectory(bestPath);

  // Sync back to redundant locations if we found a more up-to-date version
  for (const p of paths) {
    if (p !== bestPath) {
      try {
        if (fs.existsSync(bestPath) && bestSize > 0) {
          ensureParentDirectory(p);
          fs.copyFileSync(bestPath, p);
        }
      } catch (e) {
        // Quietly ignore copy failures for restricted filesystems
      }
    }
  }

  return bestPath;
}

const activeDbPath = getActiveDatabasePath();

/**
 * Singleton database connection instance.
 */
let dbInstance: Database.Database | null = null;

export function getDatabaseConnection(): Database.Database {
  if (!dbInstance) {
    try {
      dbInstance = new Database(activeDbPath);
      
      // Optimize better-sqlite3 connection for performance and persistence
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('synchronous = NORMAL');
      
      // Ensure the core collections table exists
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS collections (
          name TEXT PRIMARY KEY,
          data TEXT NOT NULL
        );
      `);
      
      console.info(`[SQLite] Persistent connection successfully initialized at: ${activeDbPath}`);
    } catch (err) {
      console.error(`[SQLite] Failed to initialize database connection at ${activeDbPath}:`, err);
      // Fallback to in-memory database if filesystem is completely locked
      dbInstance = new Database(':memory:');
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS collections (
          name TEXT PRIMARY KEY,
          data TEXT NOT NULL
        );
      `);
      console.warn('[SQLite] Utilizing in-memory fallback database.');
    }
  }
  return dbInstance;
}

/**
 * Replicates active database updates to other persistent paths.
 * Shuts down WAL journaling momentarily or runs a checkpoint to copy cleanly.
 */
export function syncDatabaseReplicas(): void {
  const connection = getDatabaseConnection();
  try {
    // Truncate the WAL journal into the main DB file
    connection.pragma('wal_checkpoint(TRUNCATE)');
    
    const paths = [HOME_DB_PATH, TMP_DB_PATH, DEFAULT_DB_PATH];
    for (const p of paths) {
      if (p !== activeDbPath) {
        try {
          ensureParentDirectory(p);
          fs.copyFileSync(activeDbPath, p);
        } catch (e) {
          // Ignore copy failures
        }
      }
    }
  } catch (err) {
    console.error('[SQLite] Error during database replica replication:', err);
  }
}

// Export default database instance
export const db = getDatabaseConnection();
