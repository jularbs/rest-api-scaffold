import { db } from '../db.js';

export const userRoleRepository = {
  async assignRole(userId: string, roleId: string) {
    return await db
      .insertInto('user_roles')
      .values({
        user_id: userId,
        role_id: roleId,
      })
      .onConflict((oc) => oc.doNothing())
      .execute();
  },

  async replaceRoles(userId: string, roleIds: string[]) {
    await db.deleteFrom('user_roles').where('user_id', '=', userId).execute();

    if (roleIds.length === 0) return;

    await db
      .insertInto('user_roles')
      .values(
        roleIds.map((roleId) => ({
          user_id: userId,
          role_id: roleId,
        })),
      )
      .execute();
  },
};
