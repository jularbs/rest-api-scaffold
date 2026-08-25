import { Router } from 'express';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { validateRequest } from '../../common/validators/validate-request.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authService } from './auth.service.js';
import { loginBodySchema, refreshBodySchema, registerBodySchema } from './auth.schemas.js';
import { strictAuthLimiter } from '../../middleware/rate-limiter.js';

export const authRouter = Router();

// POST routes
authRouter.post(
  '/register',
  validateRequest({ body: registerBodySchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(createSuccessResponse(result));
  }),
);

authRouter.post(
  '/login',
  strictAuthLimiter,
  validateRequest({ body: loginBodySchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.status(200).json(createSuccessResponse(result));
  }),
);

authRouter.post(
  '/refresh',
  validateRequest({ body: refreshBodySchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json(createSuccessResponse(result));
  }),
);

// GET routes
authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.authUser!.id);
    res.status(200).json(createSuccessResponse(user));
  }),
);
