import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/app-error.js';
import { createErrorResponse } from '../common/errors/error-response.js';
import { config } from '../config/index.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      createErrorResponse({
        message: error.message,
        code: error.code,
        details: error.details,
      }),
    );
  }

  console.error('Unhandled application error:', error);

  return res.status(500).json(
    createErrorResponse({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      details: config.app.isProduction ? null : error,
    }),
  );
}
