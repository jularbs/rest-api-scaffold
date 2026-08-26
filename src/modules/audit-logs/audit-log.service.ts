import { AppError } from '../../common/errors/app-error.js';
import { auditLogRepository } from '../../database/repositories/audit-log.repository.js';
import { NewAuditLogRow } from '../../database/types.js';

export const auditLogService = {
  async create(newAuditLog: NewAuditLogRow) {
    return await auditLogRepository.create(newAuditLog);
  },

  async getById(id: string) {
    const auditLog = await auditLogRepository.findById(id);
    if (!auditLog) {
      throw new AppError({
        message: 'Audit log not found',
        statusCode: 404,
        code: 'AUDIT_LOG_NOT_FOUND',
      });
    }
    return auditLog;
  },

  async list(params: {
    limit?: number;
    offset?: number;
    requestId?: string;
    performedBy?: string;
    entityName?: string;
    entityId?: string;
  }) {
    return await auditLogRepository.findAll(params);
  },
};
