import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/app-error.js';
import { verifyAccessToken } from '../modules/auth/token.js';
import { type AuthUser } from '../types/auth-user.js';

declare module 'express' {
  interface Request {
    authUser?: AuthUser;
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(
      new AppError({
        message: 'Missing or invalid Authorization header',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      }),
    );
  }
  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.authUser = payload;
    next();
  } catch {
    next(
      new AppError({
        message: 'Invalid or expired token',
        code: 'ACCESS_TOKEN_INVALID',
        statusCode: 401,
      }),
    );
  }
}
