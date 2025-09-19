import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateJwt } from '../src/middlewares/authJwt.middleware';
import { ROLES } from '../src/common/constants';
import { SweetService } from '../src/modules/sweet/sweet.service';
import { SweetValidators } from '../src/modules/sweet/sweet.validator';
import { CategoryValidators } from '../src/modules/sweet/category/category.validators';

// Mock auth middleware to inject user context
vi.mock('../src/middlewares/authJwt.middleware', () => ({
  authenticateJwt: vi.fn(),
}));

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
});
