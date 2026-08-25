import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { checkDatabaseConnection } from '../../database/db.js';
export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    await checkDatabaseConnection();

    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
      },
    });
  }),
);
