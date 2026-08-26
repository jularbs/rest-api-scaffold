import type {
  PermissionTable,
  RefreshTokenTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
  UserTable,
  AuditLogTable,
} from './types.js';

export interface Database {
  users: UserTable;
  refresh_tokens: RefreshTokenTable;
  roles: RoleTable;
  permissions: PermissionTable;
  user_roles: UserRoleTable;
  role_permissions: RolePermissionTable;
}

export interface AuditDatabase {
  audit_log: AuditLogTable;
}
