import { describe, expect, it } from 'vitest';
import config from './vite.config';

describe('vite dev server watch configuration', () => {
  it('ignores backend persistence files and server entrypoints', async () => {
    const resolved = await config({ mode: 'development', command: 'serve' } as any);
    const ignored = resolved.server?.watch?.ignored ?? [];

    expect(ignored).toEqual(expect.arrayContaining(['**/db.json', '**/server.ts', '**/server.tsx']));
  });
});
