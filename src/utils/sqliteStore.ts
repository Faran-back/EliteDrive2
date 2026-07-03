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

export function getSqliteDatabasePath(): string {
  return process.env.SQLITE_DB_PATH || DEFAULT_DB_PATH;
}

export function saveCollectionsToSqlite(collections: SqliteCollectionMap, dbPath = getSqliteDatabasePath()): boolean {
  ensureParentDir(dbPath);

  const db = new Database(dbPath);
  try {
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
    db.close();
  }
}

export function loadCollectionsFromSqlite(dbPath = getSqliteDatabasePath()): SqliteCollectionMap {
  if (!fs.existsSync(dbPath)) {
    return {};
  }

  const db = new Database(dbPath);
  try {
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
  } finally {
    db.close();
  }
}
