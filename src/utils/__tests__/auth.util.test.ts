import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
} from '../auth.util';

describe('auth.util', () => {
  it('hashes and verifies password correctly', async () => {
    const plain = 'Abcd1234@';
    const hash = await hashPassword(plain, 4);
    expect(hash).toBeTypeOf('string');
    expect(hash).not.toEqual(plain);
    expect(await verifyPassword(plain, hash)).toBe(true);
    expect(await verifyPassword('wrongPass1!', hash)).toBe(false);
  });

  it('signs and verifies access token', () => {
    process.env['ACCESS_TOKEN_SECRET'] =
      process.env['ACCESS_TOKEN_SECRET'] || 'test-secret';
    process.env['ACCESS_TOKEN_EXPIRY'] = '1h';
    const token = signAccessToken({ sub: '1', role: 'customer' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('1');
    expect(payload.role).toBe('customer');
  });
});
