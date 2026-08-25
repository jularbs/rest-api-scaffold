import request from 'supertest';
import { app } from '../setup/test-app.js';

describe('app', () => {
  it('returns API status on GET', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        status: 'running',
      }),
    );
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});
