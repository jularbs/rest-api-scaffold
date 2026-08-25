import { db } from '../db.js';
import type { RoleRow } from '../types.js';

export const roleRepository = {
  async findByKeys(keys: string[]): Promise<RoleRow[]> {
    if (keys.length === 0) {
      return [];
    }

    return await db.selectFrom('roles').selectAll().where('key', 'in', keys).execute();
  },

  async findRolesByUserId(userId: string): Promise<RoleRow[]> {
    return await db
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select(['roles.id', 'roles.key', 'roles.name', 'roles.description', 'roles.created_at'])
      .where('user_roles.user_id', '=', userId)
      .execute();
  },
};
