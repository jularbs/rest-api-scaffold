import { z } from 'zod';
import { ROLE_KEYS } from '../auth/rbac.js';

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  roles: z.array(z.enum(ROLE_KEYS)).min(1),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
});

export const userIdParamsSchema = z.object({
  id: z.uuid(),
});
