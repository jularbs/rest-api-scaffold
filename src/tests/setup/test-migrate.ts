import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { buildScopedConnectionString } from '../../database/db.js';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../');
const dbmateBin = path.resolve(repoRoot, 'node_modules/.bin/dbmate');
const migrationsDir = path.resolve(repoRoot, 'db/migrations');

export async function runTestMigrations() {
  // shell out to the real dbmate binary (instead of re-executing .sql files
  // ourselves) so its "-- migrate:up"/"-- migrate:down" sections and its
  // per-schema schema_migrations tracking table are handled correctly.
  await execFileAsync(dbmateBin, [
    '--url',
    buildScopedConnectionString(),
    '--migrations-dir',
    migrationsDir,
    '--no-dump-schema',
    'migrate',
  ]);
}
