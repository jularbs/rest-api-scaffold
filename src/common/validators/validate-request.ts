import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

type RequestSchemas = {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
};

export function validateRequest(schemas: RequestSchemas) {
  return function validationMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as Request['body'];
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request['query'];
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params'];
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError({
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details: z.treeifyError(error),
          }),
        );
      }

      return next(error);
    }
  };
}
