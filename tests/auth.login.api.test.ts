import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userRepo from '../src/modules/user/user.repository';
import * as authUtil from '../src/utils/auth.util';

describe('POST /api/auth/user/login', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('200 on valid credentials, returns tokens and sets cookies', async () => {
    // mock repo to return a user with passwordHash
    vi.spyOn(userRepo.userRepository, 'findByEmail').mockResolvedValue({
      id: 14,
      name: 'Max',
      email: 'max@example.com',
      role: 'customer',
      isActive: true,
      createdAt: '2025-09-18 10:00:00',
      updatedAt: '2025-09-18 10:00:00',
      deletedAt: null,
      passwordHash: 'hashed',
    } as any);
    // password matches
    vi.spyOn(authUtil, 'verifyPassword').mockResolvedValue(true as any);
    // deterministic tokens
    vi.spyOn(authUtil, 'signAccessToken').mockReturnValue('access.jwt' as any);
    vi.spyOn(authUtil, 'signRefreshToken').mockReturnValue(
      'refresh.jwt' as any
    );

    const res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'max@example.com', password: 'Abcd1234@' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      id: 14,
      email: 'max@example.com',
      role: 'customer',
    });
    expect(typeof res.body.data.accessToken).toBe('string');
    expect(typeof res.body.data.refreshToken).toBe('string');
    const rawCookies = res.headers['set-cookie'];
    const cookies = Array.isArray(rawCookies)
      ? rawCookies
      : rawCookies
        ? [rawCookies]
        : [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('404 when email does not exist', async () => {
    vi.spyOn(userRepo.userRepository, 'findByEmail').mockResolvedValue(
      null as any
    );

    const res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'nope@example.com', password: 'Abcd1234@' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('400 when password is invalid', async () => {
    vi.spyOn(userRepo.userRepository, 'findByEmail').mockResolvedValue({
      id: 1,
      name: 'Jane',
      email: 'jane@example.com',
      role: 'customer',
      isActive: true,
      createdAt: '2025-09-18 10:00:00',
      updatedAt: '2025-09-18 10:00:00',
      deletedAt: null,
      passwordHash: 'hashed',
    } as any);
    vi.spyOn(authUtil, 'verifyPassword').mockResolvedValue(false as any);

    const res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'jane@example.com', password: 'WrongPass1!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
