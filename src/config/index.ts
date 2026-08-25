import { env } from './env.js';

export const config = {
  app: {
    name: 'Basic REST API',
    env: env.NODE_ENV,
    port: env.PORT,
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    isProduction: env.NODE_ENV === 'production',
  },
  database: {
    url: env.DATABASE_URL,
  },
  auth: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresInMinutes: env.JWT_ACCESS_EXPIRES_IN_MINUTES,
    refreshExpiresInDays: env.JWT_REFRESH_EXPIRES_IN_DAYS,
    cookieSecure: env.COOKIE_SECURE,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;
