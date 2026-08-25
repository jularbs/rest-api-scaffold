import pg from 'pg';
import { sql } from 'kysely';
import { db } from '../../database/db.js';
import { config } from '../../config/index.js';
import { getTestSchemaName } from './test-worker.js';

function getAdminConnectionString() {
  return config.database.url;
}

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function ensureTestSchemaExists() {
  const schema = getTestSchemaName();
  const pool = new pg.Pool({
    connectionString: getAdminConnectionString(),
  });

  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schema)}`);
  } finally {
    await pool.end();
  }
}

export async function dropTestSchema() {
  const schema = getTestSchemaName();
  const pool = new pg.Pool({
    connectionString: getAdminConnectionString(),
  });

  try {
    await pool.query(`DROP SCHEMA IF EXISTS ${quoteIdentifier(schema)} CASCADE`);
  } finally {
    await pool.end();
  }
}

export async function truncateAllTables() {
  await sql
    .raw(
      `
    TRUNCATE TABLE
      refresh_tokens,
      user_roles,
      role_permissions,
      permissions,
      roles,
      users
    RESTART IDENTITY CASCADE
  `,
    )
    .execute(db);
}
