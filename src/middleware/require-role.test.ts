import { requireRole } from './require-role.js';

describe('requireRole middleware', () => {
  it('calls next with no error when user has an allowed role', () => {
    const middleware = requireRole('admin');

    const req = {
      authUser: {
        id: 'user-1',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: ['user.create', 'user.read'],
      },
    };

    const res = {};
    const next = vi.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with unauthorized error when authUser is missing', () => {
    const middleware = requireRole('admin');

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

  it('calls next with forbidden error when the user lacks the required role', () => {
    const middleware = requireRole('admin');

    const req = {
      authUser: {
        id: 'user-2',
        email: 'guest@example.com',
        roles: ['guest'],
        permissions: ['auth.me.read'],
      },
    };

    const res = {};
    const next = vi.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});
