import { z } from 'zod';

export const registerBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export const loginBodySchema = z.object({
  email: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});
