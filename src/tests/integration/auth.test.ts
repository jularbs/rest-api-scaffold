import request from 'supertest';
import { app } from '../setup/test-app.js';
import { seedRbacBasics, createUser } from '../setup/factories.js';
import { authHeader, loginAs } from '../setup/helpers.js';
describe('auth routes', () => {
  beforeEach(async () => {
    await seedRbacBasics();
  });

  it('logs in successfully with valid credentials', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const response = await loginAs({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        rawRefreshToken: expect.any(String),
        user: expect.objectContaining({
          email: 'admin@example.com',
        }),
      }),
    );
  });

  it('fails login with invalid credentials', async () => {
    const response = await loginAs({
      email: 'non-existing-email',
      password: 'password1234!',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'INVALID_CREDENTIALS',
      }),
    );
  });

  it('fails login with incorrect password', async () => {
    await createUser({
      email: 'user@example.com',
      password: 'CorrectPassword123!',
      roles: ['admin'],
    });

    const response = await loginAs({
      email: 'user@example.com',
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'INVALID_CREDENTIALS',
      }),
    );
  });

  it('returns 403 when inactive user tries to log in', async () => {
    await createUser({
      email: 'user@example.com',
      password: 'Password123!',
      roles: ['admin'],
      isActive: false,
    });

    const response = await loginAs({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'USER_INACTIVE',
      }),
    );
  });

  it('returns 409 when registering with an existing email', async () => {
    await createUser({
      email: 'existing@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const response = await request(app).post('/auth/register').send({
      email: 'existing@example.com',
      password: 'Password123!',
      firstName: 'Existing',
      lastName: 'User',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'EMAIL_ALREADY_IN_USE',
      }),
    );
  });

  it('returns 400 for invalid register payload', async () => {
    const response = await request(app).post('/auth/register').send({
      email: 'not-an-email',
      password: '123',
      firstName: '',
      lastName: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns current user for valid bearer token', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'password123!',
      roles: ['admin'],
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'password123!',
    });

    const token = loginResponse.body.data.accessToken;

    const meResponse = await request(app).get('/auth/me').set(authHeader(token));

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);
    expect(meResponse.body.data).toEqual(
      expect.objectContaining({
        email: 'admin@example.com',
      }),
    );
  });

  it('returns 400 for invalid login payload', async () => {
    const response = await request(app).post('/auth/login').send({
      email: '',
      password: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 401 when /auth/me is called with an invalid token', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'ACCESS_TOKEN_INVALID',
      }),
    );
  });

  it('returns 401 when /auth/me has no bearer token', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    );
  });

  it('refreshes tokens successfully with a valid refresh token', async () => {
    await createUser({
      email: 'refresh@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const loginResponse = await request(app).post('/auth/login').send({
      email: 'refresh@example.com',
      password: 'Password123!',
    });

    const refreshToken = loginResponse.body.data.rawRefreshToken;

    const refreshResponse = await request(app).post('/auth/refresh').send({
      refreshToken,
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.success).toBe(true);
    expect(refreshResponse.body.data).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        rawRefreshToken: expect.any(String),
        user: expect.objectContaining({
          email: 'refresh@example.com',
        }),
      }),
    );
  });

  it('returns 401 for an invalid refresh token', async () => {
    const response = await request(app).post('/auth/refresh').send({
      refreshToken: 'not-a-real-refresh-token',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'INVALID_REFRESH_TOKEN',
      }),
    );
  });

  it('returns 401 when a refresh token is reused after rotation', async () => {
    await createUser({
      email: 'rotation@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const loginResponse = await loginAs({
      email: 'rotation@example.com',
      password: 'Password123!',
    });

    const refreshToken = loginResponse.body.data.rawRefreshToken;

    const firstRefreshResponse = await request(app).post('/auth/refresh').send({
      refreshToken,
    });

    expect(firstRefreshResponse.status).toBe(200);

    const secondRefreshResponse = await request(app).post('/auth/refresh').send({
      refreshToken,
    });

    expect(secondRefreshResponse.status).toBe(401);
    expect(secondRefreshResponse.body.success).toBe(false);
    expect(secondRefreshResponse.body.error).toEqual(
      expect.objectContaining({
        code: 'REFRESH_TOKEN_REVOKED',
      }),
    );
  });

  it('returns 400 for invalid refresh payload', async () => {
    const response = await request(app).post('/auth/refresh').send({
      refreshToken: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
