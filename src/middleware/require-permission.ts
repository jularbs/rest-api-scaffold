import { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/app-error.js';

export function requirePermission(...allowedPermissions: string[]) {
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

    const hasPermission = authUser.permissions.some((permission) =>
      allowedPermissions.includes(permission),
    );

    if (!hasPermission) {
      return next(
        new AppError({
          message: 'You do not have the required permission',
          statusCode: 403,
          code: 'FORBIDDEN',
        }),
      );
    }

    next();
  };
}
