import dotenv from 'dotenv';
import { cleanEnv, bool, num, port, str } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    default: 'development',
  }),
  PORT: port({
    default: 3000,
  }),
  DATABASE_URL: str(),
  DATABASE_MIGRATIONS_DIR: str({
    default: './db/main/migrations',
  }),
  AUDIT_DATABASE_URL: str(),
  AUDIT_DATABASE_MIGRATIONS_DIR: str({
    default: './db/audit/migrations',
  }),
  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_ACCESS_EXPIRES_IN_MINUTES: num({
    default: 15,
  }),
  JWT_REFRESH_EXPIRES_IN_DAYS: num({
    default: 7,
  }),
  CORS_ORIGIN: str({
    default: 'http://localhost:3000',
  }),
  LOG_LEVEL: str({
    choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
  }),
  COOKIE_SECURE: bool({
    default: false,
  }),
});
