import { Kysely, PostgresDialect, sql } from 'kysely';
import pg from 'pg';
import { config } from '../config/index.js';
import type { Database, AuditDatabase } from './schema.js';

function buildConnectionString(databaseUrl: string) {
  const schema = process.env.DB_SCHEMA;

  if (!schema) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  const existingOptions = url.searchParams.get('options');
  const schemaOption = `-c search_path=${schema}`;
  const newOptions = existingOptions ? `${existingOptions} ${schemaOption}` : schemaOption;
  url.searchParams.set('options', newOptions);
  return url.toString();
}

// exported so test setup can point dbmate itself at the same per-worker schema
export const buildScopedConnectionString = buildConnectionString;

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: buildConnectionString(config.database.url),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      maxLifetimeSeconds: 1_800,
    }),
  }),
});

export const auditdb = new Kysely<AuditDatabase>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: buildConnectionString(config.auditDatabase.url),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      maxLifetimeSeconds: 1_800,
    }),
  }),
});

export async function checkDatabaseConnection() {
  await sql`SELECT 1`.execute(db);
  await sql`SELECT 1`.execute(auditdb);
}

export async function closeDatabase() {
  await db.destroy();
  await auditdb.destroy();
}
