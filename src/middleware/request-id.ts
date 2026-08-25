import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare module 'express' {
  interface Request {
    id?: string;
  }
}

const REQUEST_ID_HEADER = 'x-request-id';
// RFC 4122 UUID, loosely validated so we don't propagate arbitrary client input unchecked
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.headers[REQUEST_ID_HEADER];
  const candidate = Array.isArray(incomingId) ? incomingId[0] : incomingId;

  req.id = candidate && UUID_PATTERN.test(candidate) ? candidate : crypto.randomUUID();

  res.setHeader('X-Request-Id', req.id);
  next();
}
