import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock sweet.zod parsers to passthrough values
vi.mock('../sweet.zod', () => ({
  sweetListQuerySchema: { parse: (v: any) => v },
  sweetSearchSchema: { parse: (v: any) => v },
  sweetCreateSchema: { parse: (v: any) => v },
  sweetUpdateSchema: { parse: (v: any) => v },
  sweetId: { parse: (v: any) => Number(v) },
}));

// Mock services/validators
vi.mock('../sweet.service', () => ({
  SweetService: {
    listSweets: vi.fn(),
    searchSweets: vi.fn(),
    getSweetById: vi.fn(),
    createSweet: vi.fn(),
    updateSweet: vi.fn(),
    deleteSweet: vi.fn(),
  },
}));

vi.mock('../sweet.validator', () => ({
  SweetValidators: {
    isSweetAlreadyExistByName: vi.fn(),
    isSweetAlreadyExistBeforeUpdate: vi.fn(),
    ensureSweetExists: vi.fn(),
  },
}));

// Mock CategoryValidators so controller uses these mocked functions
vi.mock('../category/category.validators', () => ({
  CategoryValidators: {
    ensureCategoryActive: vi.fn(),
    ensureCategoryExists: vi.fn(),
  },
}));

// Import SUT and collaborators AFTER mocks so spies are applied
import { SweetController } from '../sweet.controller';
import { SweetService } from '../sweet.service';
import { SweetValidators } from '../sweet.validator';
import { CategoryValidators } from '../category/category.validators';

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('SweetController', () => {
  const adminReq = (overrides: any = {}) =>
    ({
      user: { role: 'admin' },
      params: {},
      query: {},
      body: {},
      ...overrides,
    }) as any;

  const customerReq = (overrides: any = {}) =>
    ({
      user: { role: 'customer' },
      params: {},
      query: {},
      body: {},
      ...overrides,
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default resolved values for mocked category validators
    vi.mocked(CategoryValidators.ensureCategoryActive).mockResolvedValue(
      undefined as any
    );
    vi.mocked(CategoryValidators.ensureCategoryExists).mockResolvedValue(
      undefined as any
    );
  });

  it('listSweets should call service with parsed query and role', async () => {
    const req = customerReq({ query: { page: 1 } });
    const res = mockRes();
    vi.mocked(SweetService.listSweets).mockResolvedValue({
      items: [],
      total: 0,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    } as any);
    await (SweetController.listSweets as any)(req, res);
    expect(SweetService.listSweets).toHaveBeenCalledWith(
      { page: 1 },
      'customer'
    );
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('searchSweets should call service with parsed query and role', async () => {
    const req = customerReq({ query: { q: 'choc' } });
    const res = mockRes();
    vi.mocked(SweetService.searchSweets).mockResolvedValue([] as any);
    await (SweetController.searchSweets as any)(req, res);
    expect(SweetService.searchSweets).toHaveBeenCalledWith(
      { q: 'choc' },
      'customer'
    );
    expect(res.status).toHaveBeenCalled();
  });

  it('getSweetById should validate id and call service', async () => {
    const req = customerReq({ params: { id: '5' } });
    const res = mockRes();
    vi.mocked(SweetValidators.ensureSweetExists).mockResolvedValue(
      undefined as any
    );
    vi.mocked(SweetService.getSweetById).mockResolvedValue({ id: 5 } as any);
    await (SweetController.getSweetById as any)(req, res);
    expect(SweetValidators.ensureSweetExists).toHaveBeenCalledWith(
      5,
      'customer'
    );
    expect(SweetService.getSweetById).toHaveBeenCalledWith(5, 'customer');
  });

  it('deleteSweet should call service with parsed id and role', async () => {
    const req = adminReq({ params: { id: '9' } });
    const res = mockRes();
    vi.mocked(SweetService.deleteSweet).mockResolvedValue({ id: 9 } as any);
    await (SweetController.deleteSweet as any)(req, res);
    expect(SweetService.deleteSweet).toHaveBeenCalledWith(9, 'admin');
  });
});
