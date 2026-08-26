import { auditdb } from '../db.js';
import type { NewAuditLogRow, AuditLogRow } from '../types.js';

export const auditLogRepository = {
  async create(newAuditLog: NewAuditLogRow): Promise<AuditLogRow> {
    return await auditdb
      .insertInto('audit_log')
      .values(newAuditLog)
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async findById(id: string): Promise<AuditLogRow | null> {
    const result = await auditdb
      .selectFrom('audit_log')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return result ?? null;
  },

  async findAll(params: {
    limit?: number;
    offset?: number;
    requestId?: string;
    performedBy?: string;
    entityName?: string;
    entityId?: string;
  }): Promise<Partial<AuditLogRow>[]> {
    let query = auditdb
      .selectFrom('audit_log')
      .select([
        'id',
        'request_id',
        'performed_by',
        'entity_name',
        'entity_id',
        'performed_at',
        'action',
      ]);

    if (params.entityName) query = query.where('entity_name', '=', params.entityName);

    if (params.entityId) query = query.where('entity_id', '=', params.entityId);

    if (params.requestId) query = query.where('request_id', '=', params.requestId);

    if (params.performedBy) query = query.where('performed_by', '=', params.performedBy);

    query = query
      .orderBy('performed_at', 'desc')
      .limit(params.limit ?? 25)
      .offset(params.offset ?? 0);

    return await query.execute();
  },
};
