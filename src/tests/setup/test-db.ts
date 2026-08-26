import pg from 'pg';
import { sql } from 'kysely';
import { auditdb, db } from '../../database/db.js';
import { getTestSchemaName } from './test-worker.js';

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function ensureTestSchemaExists(connectionString: string) {
  const schema = getTestSchemaName();
  const pool = new pg.Pool({
    connectionString: connectionString,
  });

  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schema)}`);
  } finally {
    await pool.end();
  }
}

export async function dropTestSchema(connectionString: string) {
  const schema = getTestSchemaName();
  const pool = new pg.Pool({
    connectionString: connectionString,
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

  await sql
    .raw(
      `
    TRUNCATE TABLE
      audit_log
    RESTART IDENTITY CASCADE
  `,
    )
    .execute(auditdb);
}
