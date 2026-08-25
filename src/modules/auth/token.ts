import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import type { AuthUser } from '../../types/auth-user.js';

type AccessTokenPayload = AuthUser;

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(user, config.auth.accessSecret, {
    expiresIn: `${config.auth.accessExpiresInMinutes}m`,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.auth.accessSecret) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.auth.refreshExpiresInDays);
  return expiresAt;
}
