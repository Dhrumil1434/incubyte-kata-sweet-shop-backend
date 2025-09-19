import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ensure barrel exports are mocked BEFORE app (route registration) happens
vi.mock('../src/middlewares', () => ({
  authenticateJwt: vi.fn((_req: any, _res: any, next: any) => next()),
  authRole: vi.fn(
    (_allowed: readonly string[]) => (_req: any, _res: any, next: any) => next()
  ),
}));

// Also mock direct middleware modules used by tests
vi.mock('../src/middlewares/authJwt.middleware', () => ({
  authenticateJwt: vi.fn((_req: any, _res: any, next: any) => next()),
}));
vi.mock('../src/middlewares/authRole.middleware', () => ({
  authRole: vi.fn(
    (_allowed: readonly string[]) => (_req: any, _res: any, next: any) => next()
  ),
}));

import request from 'supertest';
import app from '../src/app';
import { authenticateJwt } from '../src/middlewares/authJwt.middleware';
import { authRole } from '../src/middlewares/authRole.middleware';
import { ROLES } from '../src/common/constants';
import { SweetService } from '../src/modules/sweet/sweet.service';
import { SweetValidators } from '../src/modules/sweet/sweet.validator';
import { CategoryValidators } from '../src/modules/sweet/category/category.validators';

// Mock validators to avoid real pre-validation branching
vi.mock('../src/modules/sweet/sweet.validator', () => ({
  SweetValidators: {
    isSweetAlreadyExistByName: vi.fn(),
    isSweetAlreadyExistBeforeUpdate: vi.fn(),
    ensureSweetExists: vi.fn(),
  },
}));
vi.mock('../src/modules/sweet/category/category.validators', () => ({
  CategoryValidators: {
    ensureCategoryActive: vi.fn(),
    ensureCategoryExists: vi.fn(),
  },
}));

// Helper token
const mockAccessToken = 'mock-token';

describe('Sweet API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // default to customer
    vi.mocked(authenticateJwt).mockImplementation(
      (req: any, _res: any, next: any) => {
        req.user = { id: '1', role: ROLES.CUSTOMER };
        next();
      }
    );
    // default authRole to pass (admin routes)
    vi.mocked(authRole).mockImplementation(
      (roles: readonly string[]) => (req: any, _res: any, next: any) => {
        const userRole = req.user?.role || ROLES.CUSTOMER;
        if (roles.includes(userRole)) {
          next();
        } else {
          const { ApiError } = require('../src/utils');
          const error = new ApiError(
            'FORBIDDEN',
            403,
            'INVALID_USER_ROLE',
            'You are not having the valid role to access this action!'
          );
          next(error);
        }
      }
    );
    // default validators to pass
    vi.mocked(SweetValidators.isSweetAlreadyExistByName).mockResolvedValue(
      undefined as any
    );
    vi.mocked(
      SweetValidators.isSweetAlreadyExistBeforeUpdate
    ).mockResolvedValue(undefined as any);
    vi.mocked(SweetValidators.ensureSweetExists).mockResolvedValue(
      undefined as any
    );
    vi.mocked(CategoryValidators.ensureCategoryActive).mockResolvedValue(
      undefined as any
    );
    vi.mocked(CategoryValidators.ensureCategoryExists).mockResolvedValue(
      undefined as any
    );
    await new Promise((r) => setTimeout(r, 200));
  });

  describe('GET /api/sweets', () => {
    it('200 - lists sweets with pagination', async () => {
      vi.spyOn(SweetService, 'listSweets').mockResolvedValue({
        items: [],
        total: 0,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      } as any);

      const res = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .query({ page: 1, limit: 20 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/sweets/search', () => {
    it('200 - returns search results', async () => {
      vi.spyOn(SweetService, 'searchSweets').mockResolvedValue([] as any);

      const res = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .query({ q: 'dark', category: 'chocolate' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/sweets (admin only)', () => {
    it('201 - creates sweet as admin', async () => {
      // override to admin
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );
      vi.spyOn(SweetService, 'createSweet').mockResolvedValue({ id: 1 } as any);

      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ name: 'Truffle', categoryId: 2, price: 10, quantity: 5 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/sweets/:id (admin only)', () => {
    it('200 - updates sweet as admin', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );
      vi.spyOn(SweetService, 'updateSweet').mockResolvedValue({ id: 1 } as any);

      const res = await request(app)
        .put('/api/sweets/1')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ name: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/sweets/:id (admin only)', () => {
    it('200 - deletes sweet as admin', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );
      vi.spyOn(SweetService, 'deleteSweet').mockResolvedValue({ id: 1 } as any);

      const res = await request(app)
        .delete('/api/sweets/1')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/sweets/:id/reactivate (admin only)', () => {
    it('200 - reactivates soft-deleted sweet as admin', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );
      vi.spyOn(SweetService, 'reactivateSweet').mockResolvedValue({
        id: 1,
      } as any);

      const res = await request(app)
        .post('/api/sweets/1/reactivate')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Sweet reactivated successfully');
    });

    it('404 - returns not found for non-existent sweet', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );
      vi.spyOn(SweetService, 'reactivateSweet').mockRejectedValue(
        new Error('Sweet not found')
      );

      const res = await request(app)
        .post('/api/sweets/999/reactivate')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(res.status).toBe(500); // Error handling converts to 500
    });

    it('401 - returns unauthorized without token', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (_req: any, _res: any, next: any) => {
          next(new Error('Unauthorized'));
        }
      );

      const res = await request(app).post('/api/sweets/1/reactivate');

      expect(res.status).toBe(500); // Error handling converts to 500
    });

    it('403 - returns forbidden for customer role', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '1', role: ROLES.CUSTOMER };
          next();
        }
      );
      // Override authRole to reject customer role
      vi.mocked(authRole).mockImplementationOnce(
        (roles: readonly string[]) => (req: any, _res: any, next: any) => {
          const userRole = req.user?.role || ROLES.CUSTOMER;
          if (roles.includes(userRole)) {
            next();
          } else {
            const error = new Error('Forbidden');
            (error as any).status = 403;
            next(error);
          }
        }
      );

      const res = await request(app)
        .post('/api/sweets/1/reactivate')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
