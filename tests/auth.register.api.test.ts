import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userRepo from '../src/modules/user/user.repository';

describe('POST /api/auth/user/register', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('201 when new user registers', async () => {
    vi.spyOn(userRepo.userRepository, 'isEmailTaken').mockResolvedValue(false);
    vi.spyOn(userRepo.userRepository, 'createUser').mockResolvedValue({
      id: 1,
      name: 'Max',
      email: 'max@example.com',
      role: 'customer',
      isActive: true,
      createdAt: '2025-09-18 10:00:00',
      updatedAt: '2025-09-18 10:00:00',
      deletedAt: null,
    } as any);

    const res = await request(app)
      .post('/api/auth/user/register')
      .send({
        name: 'Max',
        email: 'max@example.com',
        password: 'Abcd1234@',
        role: 'customer',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: 1,
      name: 'Max',
      email: 'max@example.com',
      role: 'customer',
    });
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('409 when email already exists', async () => {
    vi.spyOn(userRepo.userRepository, 'isEmailTaken').mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/user/register')
      .send({
        name: 'Max',
        email: 'dup@example.com',
        password: 'Abcd1234@',
        role: 'customer',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
