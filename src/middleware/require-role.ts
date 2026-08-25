import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors/app-error.js';

export function requireRole(...allowedRoles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const authUser = req.authUser;

    if (!authUser) {
      return next(
        new AppError({
          message: 'Authentication Required',
          statusCode: 401,
          code: 'UNAUTHORIZED',
        }),
      );
    }

    const hasRole = authUser.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return next(
        new AppError({
          message: 'You do not have the required role',
          statusCode: 403,
          code: 'FORBIDDEN',
        }),
      );
    }

    next();
  };
}
