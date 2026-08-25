import request from 'supertest';
import { app } from '../setup/test-app.js';
import { createUser, seedRbacBasics } from '../setup/factories.js';
import { loginAs, authHeader } from '../setup/helpers.js';

describe('user routes', () => {
  beforeEach(async () => {
    await seedRbacBasics();
  });

  it('returns 401 when creating user without user authentication', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        email: 'newuser@example.com',
        password: 'Password123!',
        roles: ['admin'],
        first_name: 'New',
        last_name: 'User',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    );
  });

  it('allows an admin to create a new user', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post('/users')
      .set(authHeader(token))
      .send({
        email: 'newuser@example.com',
        password: 'Password123!',
        roles: ['admin'],
        first_name: 'New',
        last_name: 'User',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        email: 'newuser@example.com',
        roles: ['admin'],
        firstName: 'New',
        lastName: 'User',
        isActive: true,
      }),
    );
  });

  it('returns 409 when admin creates a user with duplicate email', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'password1234!',
      roles: ['admin'],
    });

    await createUser({
      email: 'existing-user@example.com',
      password: 'password1234!',
      roles: ['admin'],
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'password1234!',
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post('/users')
      .set(authHeader(token))
      .send({
        email: 'existing-user@example.com',
        password: 'password1234!',
        roles: ['admin'],
        first_name: 'Existing',
        last_name: 'User',
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'EMAIL_ALREADY_IN_USE',
      }),
    );
  });

  it('returns 200 when admin fetches a user by id', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const targetUser = await createUser({
      email: 'target@example.com',
      password: 'Password123!',
      roles: ['admin'],
      firstName: 'Target',
      lastName: 'User',
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app).get(`/users/${targetUser.id}`).set(authHeader(token));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: targetUser.id,
        email: 'target@example.com',
      }),
    );
  });

  it('returns 404 when admin fetches a missing user', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get('/users/11111111-1111-4111-8111-111111111111')
      .set(authHeader(token));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'USER_NOT_FOUND',
      }),
    );
  });

  it('returns 400 for invalid create user payload', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app).post('/users').set(authHeader(token)).send({
      email: 'not-an-email',
      password: '123',
      roles: [],
      first_name: '',
      last_name: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
