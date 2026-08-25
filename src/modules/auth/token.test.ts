import {
  generateRefreshToken,
  getRefreshTokenExpirationDate,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from './token.js';
describe('Token Helpers', () => {
  it('signs and verifies an access token', () => {
    const payload = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      roles: ['admin'],
      permissions: ['read:users', 'write:users'],
    };

    const token = signAccessToken(payload);
    const verifiedPayload = verifyAccessToken(token);
    expect(typeof token).toBe('string');
    expect(verifiedPayload).toEqual(expect.objectContaining(payload));
  });

  it('generates a refresh token string', () => {
    const token = generateRefreshToken();

    expect(token).toEqual(expect.any(String));
    expect(token.length).toBeGreaterThan(20);
  });

  it('hashes the same refresh token deterministically', () => {
    const token = 'static-refresh-token-for-testing';
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
  });

  it('returns a future refresh token expiration date', () => {
    const now = new Date();

    const expiresAt = getRefreshTokenExpirationDate();
    expect(expiresAt).toBeInstanceOf(Date);
    expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
  });
});
