import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const directory = await mkdtemp(join(tmpdir(), 'match-calendar-tests-'));
try {
  await build({
    entryPoints: [
      'tests/auth.test.ts',
      'tests/finance.test.ts',
      'tests/flightDistance.test.ts',
      'tests/matchReadyMerge.test.ts',
    ],
    bundle: true,
    platform: 'node',
    format: 'esm',
    tsconfig: 'tsconfig.app.json',
    outdir: directory,
    outExtension: { '.js': '.mjs' },
  });
  await import(pathToFileURL(join(directory, 'auth.test.mjs')).href);
  await import(pathToFileURL(join(directory, 'finance.test.mjs')).href);
  await import(pathToFileURL(join(directory, 'flightDistance.test.mjs')).href);
  await import(pathToFileURL(join(directory, 'matchReadyMerge.test.mjs')).href);
} finally {
  await rm(directory, { recursive: true, force: true });
}
