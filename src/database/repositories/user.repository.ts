import { db } from '../db.js';
import type { NewUserRow, UserRow } from '../types.js';

type UserRowWithRoles = UserRow & { roles: string[] };

export const userRepository = {
  async create(user: NewUserRow): Promise<UserRow> {
    return await db.insertInto('users').values(user).returningAll().executeTakeFirstOrThrow();
  },

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return await db.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst();
  },

  async findById(id: string): Promise<UserRowWithRoles | undefined> {
    const user = await db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();
    if (!user) {
      return undefined;
    }

    const roles = await db
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select('roles.key as key')
      .where('user_roles.user_id', '=', id)
      .execute()
      .then((rows) => rows.map((row) => row.key));

    return { ...user, roles };
  },

  async list(): Promise<UserRow[]> {
    return await db.selectFrom('users').selectAll().execute();
  },

  async emailExists(email: string): Promise<boolean> {
    const user = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst();
    return Boolean(user);
  },
};
