import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const directory = await mkdtemp(join(tmpdir(), 'match-calendar-tests-'));
try {
  const outfile = join(directory, 'test.mjs');
  await build({
    entryPoints: ['tests/finance.test.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    tsconfig: 'tsconfig.app.json',
    outfile,
  });
  await import(pathToFileURL(outfile).href);
} finally {
  await rm(directory, { recursive: true, force: true });
}
