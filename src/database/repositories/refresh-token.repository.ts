import { db } from '../db.js';
import { NewRefreshTokenRow, RefreshTokenRow, RefreshTokenRowUpdate } from '../types.js';

export const refreshTokenRepository = {
  async create(token: NewRefreshTokenRow): Promise<RefreshTokenRow> {
    return await db
      .insertInto('refresh_tokens')
      .values(token)
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRow | undefined> {
    return await db
      .selectFrom('refresh_tokens')
      .selectAll()
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();
  },

  async revokeById(id: string): Promise<RefreshTokenRow | undefined> {
    return await db
      .updateTable('refresh_tokens')
      .set({
        revoked_at: new Date(),
      } satisfies RefreshTokenRowUpdate)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await db
      .updateTable('refresh_tokens')
      .set({
        revoked_at: new Date(),
      } satisfies RefreshTokenRowUpdate)
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();
  },
};
