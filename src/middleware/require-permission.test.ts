import { requirePermission } from './require-permission.js';
describe('Require Permission Middleware', () => {
  it('calls next() if the user has the required permission', () => {
    const middleware = requirePermission('read:users');

    const req = {
      authUser: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['read:users', 'write:users'],
      },
    };

    const res = {};
    const next = vi.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next() with an unauthorized error when authUser is missing', () => {
    const middleware = requirePermission('read:users');

    const req = {};
    const res = {};
    const next = vi.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];

    expect(error).toBeDefined();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('calls next() with a forbidden error when user lacks the required permission', () => {
    const middleware = requirePermission('delete:users');

    const req = {
      authUser: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['read:users', 'write:users'],
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});
