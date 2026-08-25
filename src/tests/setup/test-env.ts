import { getTestSchemaName } from './test-worker.js';

if (!process.env.DB_SCHEMA) {
  process.env.DB_SCHEMA = getTestSchemaName();
}
