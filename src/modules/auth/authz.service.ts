import { roleRepository } from '../../database/repositories/role.repository.js';
import { permissionRepository } from '../../database/repositories/permission.repository.js';
import type { UserRow } from '../../database/types.js';
import type { AuthUser } from '../../types/auth-user.js';

export const authzService = {
  async getUserRoles(userId: string): Promise<string[]> {
    const roles = await roleRepository.findRolesByUserId(userId);
    return roles.map((role) => role.key);
  },

  async getUserPermissions(userId: string): Promise<string[]> {
    return await permissionRepository.findPermissionsByUserId(userId);
  },

  async buildAuthUser(user: UserRow): Promise<AuthUser> {
    const [roles, permissions] = await Promise.all([
      this.getUserRoles(user.id),
      this.getUserPermissions(user.id),
    ]);

    return {
      id: user.id,
      email: user.email,
      roles,
      permissions,
    };
  },
};
