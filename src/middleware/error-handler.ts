import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/app-error.js';
import { createErrorResponse } from '../common/errors/error-response.js';
import { config } from '../config/index.js';
import { logger } from '../common/utils/logger.js';

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error({ err: error }, 'application error');
    } else {
      logger.warn({ code: error.code, message: error.message }, 'request rejected');
    }

    return res.status(error.statusCode).json(
      createErrorResponse({
        message: error.message,
        code: error.code,
        details: error.details,
        requestId: req.id,
      }),
    );
  }

  logger.error({ err: error }, 'unhandled application error');

  return res.status(500).json(
    createErrorResponse({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      details: config.app.isProduction ? null : error,
      requestId: req.id,
    }),
  );
}
