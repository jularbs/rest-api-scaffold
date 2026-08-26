import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { buildScopedConnectionString } from '../../database/db.js';
import { config } from '../../config/index.js';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../');
const dbmateBin = path.resolve(repoRoot, 'node_modules/.bin/dbmate');
const databaseMigrationsDir = path.resolve(repoRoot, config.database.migrationsDir);
const auditDatabaseMigrationsDir = path.resolve(repoRoot, config.auditDatabase.migrationsDir);

export async function runTestMigrations() {
  await execFileAsync(dbmateBin, [
    '--url',
    buildScopedConnectionString(config.database.url),
    '--migrations-dir',
    databaseMigrationsDir,
    '--no-dump-schema',
    'migrate',
  ]);

  await execFileAsync(dbmateBin, [
    '--url',
    buildScopedConnectionString(config.auditDatabase.url),
    '--migrations-dir',
    auditDatabaseMigrationsDir,
    '--no-dump-schema',
    'migrate',
  ]);
}
