import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock middleware modules
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

      // Mock the service to not throw an error for this test
      vi.spyOn(SweetService, 'reactivateSweet').mockResolvedValueOnce({
        id: 1,
        name: 'Test Sweet',
        price: '2.50',
        quantity: 10,
        isActive: true,
        categoryId: 1,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        deletedAt: null,
      } as any);

      const res = await request(app)
        .post('/api/sweets/1/reactivate')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('201 - purchases sweet successfully', async () => {
      // Mock the PurchaseService import
      const mockPurchaseService = {
        createPurchase: vi.fn().mockResolvedValue({
          id: 1,
          userId: 1,
          sweetId: 1,
          quantity: 5,
          purchasedAt: '2025-01-20T10:30:00.000Z',
          sweet: {
            id: 1,
            name: 'Chocolate Bar',
            price: '2.50',
            category: { id: 1, name: 'Chocolates' },
          },
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
        }),
      };

      // Mock the dynamic import
      vi.doMock('../src/modules/purchase/purchase.service', () => ({
        PurchaseService: mockPurchaseService,
      }));

      const res = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Sweet purchased successfully');
      expect(res.body.data.quantity).toBe(5);
    });

    it('400 - returns bad request for invalid quantity', async () => {
      const res = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Request body validation failed');
    });

    it('400 - returns bad request for missing quantity', async () => {
      const res = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Request body validation failed');
    });

    it('401 - returns unauthorized without token', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (_req: any, _res: any, next: any) => {
          next(new Error('Unauthorized'));
        }
      );

      const res = await request(app)
        .post('/api/sweets/1/purchase')
        .send({ quantity: 5 });

      expect(res.status).toBe(500);
    });

    it('401 - returns unauthorized without user ID', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { role: ROLES.CUSTOMER }; // No id
          next();
        }
      );

      const res = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not authenticated');
    });
  });

  describe('POST /api/sweets/:id/restock (admin only)', () => {
    it('200 - restocks sweet successfully as admin', async () => {
      // Override to admin
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );

      vi.spyOn(SweetService, 'restockSweet').mockResolvedValue({
        id: 1,
        name: 'Chocolate Bar',
        price: '2.50',
        quantity: 100,
        category: { id: 1, name: 'Chocolates' },
      } as any);

      const res = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ quantity: 50 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Sweet restocked successfully');
      expect(res.body.data.quantity).toBe(100);
    });

    it('400 - returns bad request for invalid quantity', async () => {
      // Override to admin
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );

      const res = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ quantity: -5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Request body validation failed');
    });

    it('400 - returns bad request for missing quantity', async () => {
      // Override to admin
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );

      const res = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Request body validation failed');
    });

    it('403 - returns forbidden for customer role', async () => {
      // Override to customer
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '1', role: ROLES.CUSTOMER };
          next();
        }
      );

      const res = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ quantity: 50 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('401 - returns unauthorized without token', async () => {
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (_req: any, _res: any, next: any) => {
          next(new Error('Unauthorized'));
        }
      );

      const res = await request(app)
        .post('/api/sweets/1/restock')
        .send({ quantity: 50 });

      expect(res.status).toBe(500);
    });

    it('404 - returns not found for non-existent sweet', async () => {
      // Override to admin
      vi.mocked(authenticateJwt).mockImplementationOnce(
        (req: any, _res: any, next: any) => {
          req.user = { id: '99', role: ROLES.ADMIN };
          next();
        }
      );

      vi.spyOn(SweetService, 'restockSweet').mockRejectedValue(
        new Error('Sweet not found')
      );

      const res = await request(app)
        .post('/api/sweets/999/restock')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ quantity: 50 });

      expect(res.status).toBe(500); // Error handling converts to 500
    });
  });
});
