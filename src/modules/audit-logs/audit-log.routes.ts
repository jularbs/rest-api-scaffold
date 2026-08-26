import { Router } from 'express';
import { auditLogService } from './audit-log.service.js';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { validateRequest } from '../../common/validators/validate-request.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { PERMISSIONS } from '../auth/rbac.js';
import { auditLogIdParamsSchema, auditLogQuerySchema } from './audit-log.schemas.js';

export const auditLogRouter = Router();

auditLogRouter.get(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS),
  validateRequest({ query: auditLogQuerySchema }),
  asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const filters = {
      requestId: req.query.requestId as string | undefined,
      performedBy: req.query.performedBy as string | undefined,
      entityName: req.query.entityName as string | undefined,
      entityId: req.query.entityId as string | undefined,
    };
    const auditLogs = await auditLogService.list({
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
      ...filters,
    });
    res.json(createSuccessResponse(auditLogs));
  }),
);

auditLogRouter.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS),
  validateRequest({ params: auditLogIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const auditLog = await auditLogService.getById(id as string);
    res.json(createSuccessResponse(auditLog));
  }),
);
