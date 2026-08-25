import request from 'supertest';
import { app } from '../setup/test-app.js';

export async function loginAs(params: { email: string; password: string }) {
  const response = await request(app).post('/auth/login').send({
    email: params.email,
    password: params.password,
  });

  return response;
}

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
