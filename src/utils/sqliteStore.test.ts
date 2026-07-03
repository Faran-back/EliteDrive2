import { mkdtempSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadCollectionsFromSqlite, saveCollectionsToSqlite } from './sqliteStore';

describe('sqlite persistence helpers', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('persists and reloads collections from a local sqlite file', () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), 'elite-drive-sqlite-'));
    tempDirs.push(tempDir);
    const dbPath = path.join(tempDir, 'app.sqlite');

    const collections = {
      users: [{ id: 'u1', name: 'Alice' }],
      vehicles: [{ id: 'v1', name: 'Car' }],
    };

    expect(saveCollectionsToSqlite(collections, dbPath)).toBe(true);
    expect(loadCollectionsFromSqlite(dbPath)).toEqual(collections);
  });
});
