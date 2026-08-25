import { hashPassword, verifyPassword } from './password.js';

describe('Password Helpers', () => {
  it('hashes a password into a different string', async () => {
    const plainPassword = 'mysecretpassword';
    const hashedPassword = await hashPassword(plainPassword);

    expect(hashedPassword).toEqual(expect.any(String));
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it('verifies a correct password', async () => {
    const plainPassword = 'mysecretpassword';
    const hashedPassword = await hashPassword(plainPassword);

    const isValid = await verifyPassword(plainPassword, hashedPassword);
    expect(isValid).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const plainPassword = 'mysecretpassword';
    const wrongPassword = 'wrongpassword';
    const hashedPassword = await hashPassword(plainPassword);

    const isValid = await verifyPassword(wrongPassword, hashedPassword);
    expect(isValid).toBe(false);
  });
});
