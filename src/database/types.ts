import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface UserTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface RefreshTokenTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  expires_at: Timestamp;
  created_at: Generated<Timestamp>;
  revoked_at: Timestamp | null;
}

export interface RoleTable {
  id: Generated<string>;
  key: string;
  name: string;
  description: string | null;
  created_at: Generated<Timestamp>;
}

export interface PermissionTable {
  id: Generated<string>;
  key: string;
  description: string | null;
  created_at: Generated<Timestamp>;
}

export interface UserRoleTable {
  user_id: string;
  role_id: string;
  created_at: Generated<Timestamp>;
}

export interface RolePermissionTable {
  role_id: string;
  permission_id: string;
  created_at: Generated<Timestamp>;
}

export interface AuditLogTable {
  id: Generated<string>;
  action: string;
  entity_name: string;
  entity_id: string;
  payload: Record<string, unknown> | null;
  performed_by: string | null;
  performed_at: Generated<Timestamp>;
  client_ip: string | null;
  notes: string | null;
  request_id: string | null;
}

export type UserRow = Selectable<UserTable>;
export type NewUserRow = Insertable<UserTable>;
export type UserRowUpdate = Updateable<UserTable>;

export type RefreshTokenRow = Selectable<RefreshTokenTable>;
export type NewRefreshTokenRow = Insertable<RefreshTokenTable>;
export type RefreshTokenRowUpdate = Updateable<RefreshTokenTable>;

export type RoleRow = Selectable<RoleTable>;
export type NewRoleRow = Insertable<RoleTable>;

export type PermissionRow = Selectable<PermissionTable>;
export type NewPermissionRow = Insertable<PermissionTable>;

export type UserRoleRow = Selectable<UserRoleTable>;
export type NewUserRoleRow = Insertable<UserRoleTable>;

export type RolePermissionRow = Selectable<RolePermissionTable>;
export type NewRolePermissionRow = Insertable<RolePermissionTable>;

export type AuditLogRow = Selectable<AuditLogTable>;
export type NewAuditLogRow = Insertable<AuditLogTable>;
