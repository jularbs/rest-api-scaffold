import { sql } from 'kysely';
import { db } from '../../database/db.js';
import { hashPassword } from '../../modules/auth/password.js';

export async function seedRbacBasics() {
  await sql
    .raw(
      `
    INSERT INTO roles (key, name, description)
    VALUES
      ('admin', 'Administrator', 'Full system administration access')
    ON CONFLICT (key) DO NOTHING;
  `,
    )
    .execute(db);

  await sql
    .raw(
      `
    INSERT INTO permissions (key, description)
    VALUES
      ('auth.me.read', 'Read the current authenticated user profile'),
      ('user.read', 'Read user records'),
      ('user.create', 'Create user records'),
      ('user.update', 'Update user records'),
      ('user.deactivate', 'Deactivate user records')
    ON CONFLICT (key) DO NOTHING;
  `,
    )
    .execute(db);

  await sql
    .raw(
      `
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.key IN (
      'auth.me.read',
      'user.read',
      'user.create',
      'user.update',
      'user.deactivate'
    )
    WHERE r.key = 'admin'
    ON CONFLICT DO NOTHING;
  `,
    )
    .execute(db);
}

export async function createUser(params: {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roles?: string[];
}) {
  const password = params.password ?? 'Password123!';
  const passwordHash = await hashPassword(password);

  const userResult = await sql<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  }>`
    INSERT INTO users (
      email,
      password_hash,
      first_name,
      last_name,
      is_active
    )
    VALUES (
      ${params.email},
      ${passwordHash},
      ${params.firstName ?? 'Test'},
      ${params.lastName ?? 'User'},
      ${params.isActive ?? true}
    )
    RETURNING id, email, first_name, last_name, is_active
  `.execute(db);

  const user = userResult.rows[0]!;

  const roles = params.roles ?? ['admin'];

  for (const roleKey of roles) {
    await sql`
      INSERT INTO user_roles (user_id, role_id)
      SELECT ${user.id}, r.id
      FROM roles r
      WHERE r.key = ${roleKey}
      ON CONFLICT DO NOTHING
    `.execute(db);
  }

  return {
    ...user,
    password,
    roles,
  };
}
