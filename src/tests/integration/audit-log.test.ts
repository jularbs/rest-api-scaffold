import request from 'supertest';
import { app } from '../setup/test-app.js';
import { seedRbacBasics, createUser, createAuditLog } from '../setup/factories.js';
import { authHeader, loginAs } from '../setup/helpers.js';

describe('Audit Log routes', () => {
  beforeEach(async () => {
    await seedRbacBasics();
  });

  it('return 401 when viewing audit logs without authentication', async () => {
    const response = await request(app).get('/audit-logs');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 when providing invalid pagination query parameters', async () => {
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
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ limit: 'invalid', offset: 'invalid' });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 when setting pagination query parameters to non integer values', async () => {
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
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ limit: 10.5, offset: 0.5 });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 when providing negative pagination query parameters', async () => {
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
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ limit: -10, offset: -5 });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 200 and audit logs when viewing with authentication', async () => {
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
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ limit: 10, offset: 0 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  it('returns 200 when viewing audit log by ID', async () => {
    const auditLog = await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
    });

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

    const response = await request(app).get(`/audit-logs/${auditLog.id}`).set(authHeader(token));
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: auditLog.id,
        action: auditLog.action,
        entity_name: auditLog.entity_name,
        entity_id: auditLog.entity_id,
      }),
    );
  });

  it('returns 401 when viewing audit log by ID without authentication', async () => {
    const auditLog = await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
    });

    const response = await request(app).get(`/audit-logs/${auditLog.id}`);
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns 404 when viewing a non-existent audit log by ID', async () => {
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
      .get(`/audit-logs/00000000-0000-0000-0000-000000000000`)
      .set(authHeader(token));
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('filters audit logs by entity name', async () => {
    await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
    });

    await createAuditLog({
      action: 'CREATE',
      entityName: 'Ticket',
      entityId: '456',
    });

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
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ entityName: 'User' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity_name: 'Ticket',
        }),
      ]),
    );
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity_name: 'User',
        }),
      ]),
    );
  });

  it('filters audit logs by request ID', async () => {
    const auditLog = await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
      requestId: 'test-request-id',
    });

    const auditLog2 = await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
      requestId: 'test-request-id-2',
    });

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
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ requestId: auditLog.request_id });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: auditLog2.request_id,
        }),
      ]),
    );
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: auditLog.request_id,
        }),
      ]),
    );
  });

  it('filters audit logs by performed_by ID', async () => {
    const admin = await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
      performedBy: admin.id,
    });

    await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
      performedBy: 'different-user-id',
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ performedBy: admin.id });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          performed_by: 'different-user-id',
        }),
      ]),
    );
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          performed_by: admin.id,
        }),
      ]),
    );
  });

  it('returns an error when entity ID is specified without an entity name', async () => {
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
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ entityId: '123' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('filters audit logs by entity name and entity ID', async () => {
    await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      roles: ['admin'],
    });

    await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '123',
      performedBy: 'admin-id',
    });

    await createAuditLog({
      action: 'CREATE',
      entityName: 'User',
      entityId: '324',
      performedBy: 'admin-id',
    });

    const loginResponse = await loginAs({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get('/audit-logs')
      .set(authHeader(token))
      .query({ entityName: 'User', entityId: '123' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity_name: 'User',
          entity_id: '324',
        }),
      ]),
    );
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity_name: 'User',
          entity_id: '123',
        }),
      ]),
    );
  });
});
