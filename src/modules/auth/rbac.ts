export const ROLES = {
  ADMIN: 'admin',
};

export const ROLE_KEYS = [ROLES.ADMIN] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSIONS = {
  AUTH_ME_READ: 'auth.me.read',
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DEACTIVATE: 'user.deactivate',
  VIEW_AUDIT_LOGS: 'view.audit.logs',
} as const;

export const PERMISSION_KEYS = [
  PERMISSIONS.AUTH_ME_READ,
  PERMISSIONS.USER_READ,
  PERMISSIONS.USER_CREATE,
  PERMISSIONS.USER_UPDATE,
  PERMISSIONS.USER_DEACTIVATE,
  PERMISSIONS.VIEW_AUDIT_LOGS,
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.AUTH_ME_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DEACTIVATE,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
};
