import { beforeAll, beforeEach } from 'vitest';
import { dropTestSchema, ensureTestSchemaExists, truncateAllTables } from './test-db.js';
import { runTestMigrations } from './test-migrate.js';

beforeAll(async () => {
  await ensureTestSchemaExists();
  await runTestMigrations();
  await truncateAllTables();
});

beforeEach(async () => {
  await truncateAllTables();
});

afterAll(async () => {
  await dropTestSchema();
});
