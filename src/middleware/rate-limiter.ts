import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

// tests run many requests back-to-back against a shared in-memory store,
// so rate limiting is disabled in the test environment
const skipInTest = () => config.app.isTest;

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: skipInTest,
});

// 2. Define the Strict Endpoint Limiter (Aggressive)
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to only 5 login attempts per window
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

export const customLimiter = ({
  windowMs,
  max,
  message,
}: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    standardHeaders: true, // Returns standard RateLimit-* headers
    legacyHeaders: false, // Disables outdated X-RateLimit-* headers
    message: { error: message || 'Too many requests, please try again later.' },
    skip: skipInTest,
  });
};
