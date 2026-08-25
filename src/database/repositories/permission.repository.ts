import { db } from '../db.js';

export const permissionRepository = {
  async findPermissionsByUserId(userId: string): Promise<string[]> {
    const rows = await db
      .selectFrom('user_roles')
      .innerJoin('role_permissions', 'role_permissions.role_id', 'user_roles.role_id')
      .innerJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
      .select('permissions.key')
      .where('user_roles.user_id', '=', userId)
      .groupBy('permissions.key')
      .execute();

    return rows.map((row) => row.key);
  },
};
