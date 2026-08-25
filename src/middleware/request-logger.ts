import type { NextFunction, Request, Response } from 'express';
import { logger, logStorage } from '../common/utils/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const scopedLogger = logger.child({ requestId: req.id });

  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    scopedLogger.info(
      { method: req.method, url: req.originalUrl, statusCode: res.statusCode, durationMs },
      'request completed',
    );
  });

  logStorage.run({ logger: scopedLogger }, next);
}
