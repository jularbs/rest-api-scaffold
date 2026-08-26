import { beforeAll, beforeEach } from 'vitest';
import { dropTestSchema, ensureTestSchemaExists, truncateAllTables } from './test-db.js';
import { runTestMigrations } from './test-migrate.js';
import { config } from '../../config/index.js';

beforeAll(async () => {
  await ensureTestSchemaExists(config.database.url);
  await ensureTestSchemaExists(config.auditDatabase.url);
  await runTestMigrations();
  await truncateAllTables();
});

beforeEach(async () => {
  await truncateAllTables();
});

afterAll(async () => {
  await dropTestSchema(config.database.url);
  await dropTestSchema(config.auditDatabase.url);
});
