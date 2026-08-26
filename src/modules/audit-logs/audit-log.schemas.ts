import { z } from 'zod';

export const auditLogQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .optional(),
    offset: z.coerce
      .number()
      .int('Offset must be an integer')
      .min(0, 'Offset must be at least 0')
      .optional(),
    requestId: z.string().optional(),
    performedBy: z.string().optional(),
    entityName: z.string().optional(),
    entityId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.entityId && !data.entityName) {
        return false;
      }
      return true;
    },
    {
      message: 'Entity ID cannot be specified without an entity name',
    },
  );

export const auditLogIdParamsSchema = z.object({
  id: z.uuid('ID must be a valid UUID'),
});
