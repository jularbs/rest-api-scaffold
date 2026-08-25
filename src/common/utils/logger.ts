import { AsyncLocalStorage } from 'async_hooks';
import pino from 'pino';
import { config } from '../../config/index.js';

export const logStorage = new AsyncLocalStorage<{ logger: pino.Logger }>();

const isProduction = config.app.isProduction;

const baseLogger = pino({
  level: config.logging.level,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password'],
    censor: '[REDACTED]',
  },
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});

export const logger = new Proxy(baseLogger, {
  get(target, property) {
    // Check if there is an active HTTP request context running
    const store = logStorage.getStore();
    const activeLogger = store?.logger ?? target;

    const value = activeLogger[property as keyof pino.Logger];
    // pino's methods (info/error/child/...) read internal state off `this`,
    // so a plain property read would call them with the wrong receiver
    return typeof value === 'function' ? value.bind(activeLogger) : value;
  },
});
