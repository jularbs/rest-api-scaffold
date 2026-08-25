import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import { validateRequest } from '../../common/validators/validate-request.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { PERMISSIONS } from '../auth/rbac.js';
import { createUserSchema, userIdParamsSchema } from './user.schemas.js';
import { userService } from './user.service.js';

export const userRouter = Router();

// POST routes
userRouter.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.USER_CREATE),
  validateRequest({ body: createUserSchema }),
  asyncHandler(async (req, res) => {
    const result = await userService.create(req.body);
    res.status(201).json(createSuccessResponse(result));
  }),
);

// GET routes
userRouter.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.USER_READ),
  validateRequest({ params: userIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const result = await userService.getById(
      Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    );
    res.status(200).json(createSuccessResponse(result));
  }),
);
