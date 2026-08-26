import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { config } from './config/index.js';
import { healthRouter } from './modules/health/health.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { createSuccessResponse } from './common/utils/success-response.js';
import { globalLimiter } from './middleware/rate-limiter.js';
import { requestId } from './middleware/request-id.js';
import { requestLogger } from './middleware/request-logger.js';
import { auditLogRouter } from './modules/audit-logs/audit-log.routes.js';

export const app = express();

app.disable('x-powered-by');

if (config.app.env !== 'test') {
  app.use(requestId);
  app.use(requestLogger);
}

app.use(helmet());

// CORS_ORIGIN supports a comma-separated list of allowed origins
const allowedOrigins = config.cors.origin.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

app.use('/', globalLimiter); // Apply global rate limiter to all routes

app.get('/', (_req, res) => {
  res.status(200).json(
    createSuccessResponse({
      name: config.app.name,
      status: 'running',
      environment: config.app.env,
    }),
  );
});

app.use('/health', healthRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/audit-logs', auditLogRouter);

app.use(notFoundHandler);
app.use(errorHandler);
