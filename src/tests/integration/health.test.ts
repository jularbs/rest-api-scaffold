import request from 'supertest';
import { app } from '../setup/test-app.js';

describe('health routes', () => {
  it('returns ok on GET /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        status: 'ok',
        database: 'connected',
      }),
    );
  });
});
