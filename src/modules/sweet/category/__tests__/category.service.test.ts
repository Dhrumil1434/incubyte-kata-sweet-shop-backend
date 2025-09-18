import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryService } from '../category.service';
import { categoryRepository } from '../category.repository';
import { CategoryValidators } from '../category.validators';
import { ROLES } from '../../../../common/constants';
import { ApiError } from '../../../../utils';

// Mock dependencies
vi.mock('../category.repository', () => ({
  categoryRepository: {
    create: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    getActiveCategories: vi.fn(),
    existsAndAccessible: vi.fn(),
  },
}));

vi.mock('../category.validators', () => ({
  CategoryValidators: {
    validateCategoryCreation: vi.fn(),
    ensureCategoryExistsAndReturn: vi.fn(),
    validateCategoryUpdate: vi.fn(),
    validateCategoryDeletion: vi.fn(),
  },
}));

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const mockData = { name: 'New Category' };
      const mockCreated = { id: 1, name: 'New Category', isActive: true };

      vi.mocked(CategoryValidators.validateCategoryCreation).mockResolvedValue(
        undefined
      );
      vi.mocked(categoryRepository.create).mockResolvedValue(
        mockCreated as any
      );

      const result = await CategoryService.createCategory(
        mockData,
        ROLES.ADMIN
      );

      expect(CategoryValidators.validateCategoryCreation).toHaveBeenCalledWith(
        mockData,
        ROLES.ADMIN
      );
      expect(categoryRepository.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockCreated);
    });

    it('should throw error when validation fails', async () => {
      const mockData = { name: 'New Category' };
      const validationError = new ApiError(
        'VALIDATION_ERROR',
        400,
        'INVALID_REQUEST_BODY',
        'Validation failed'
      );

      vi.mocked(CategoryValidators.validateCategoryCreation).mockRejectedValue(
        validationError
      );

      await expect(
        CategoryService.createCategory(mockData, ROLES.CUSTOMER)
      ).rejects.toThrow(validationError);

      expect(categoryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryById', () => {
    it('should get category by ID successfully', async () => {
      const mockCategory = { id: 1, name: 'Test Category', isActive: true };

      vi.mocked(
        CategoryValidators.ensureCategoryExistsAndReturn
      ).mockResolvedValue(mockCategory as any);

      const result = await CategoryService.getCategoryById(1, ROLES.CUSTOMER);

      expect(
        CategoryValidators.ensureCategoryExistsAndReturn
      ).toHaveBeenCalledWith(1, ROLES.CUSTOMER);
      expect(result).toEqual(mockCategory);
    });

    it('should throw error when category not found', async () => {
      const notFoundError = new ApiError(
        'NOT_FOUND',
        404,
        'USER_NOT_FOUND',
        'Category not found'
      );

      vi.mocked(
        CategoryValidators.ensureCategoryExistsAndReturn
      ).mockRejectedValue(notFoundError);

      await expect(
        CategoryService.getCategoryById(999, ROLES.CUSTOMER)
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('listCategories', () => {
    it('should list categories successfully', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const mockItems = [
        { id: 1, name: 'Category 1', isActive: true },
        { id: 2, name: 'Category 2', isActive: true },
      ];
      const mockResult = {
        items: mockItems,
        total: 2,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      vi.mocked(categoryRepository.list).mockResolvedValue(mockResult as any);

      const result = await CategoryService.listCategories(
        mockQuery,
        ROLES.CUSTOMER
      );

      expect(categoryRepository.list).toHaveBeenCalledWith(
        mockQuery,
        ROLES.CUSTOMER
      );
      expect(result).toEqual({
        items: mockItems,
        total: 2,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    });

    it('should handle empty list', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const mockResult = {
        items: [],
        total: 0,
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      vi.mocked(categoryRepository.list).mockResolvedValue(mockResult as any);

      const result = await CategoryService.listCategories(
        mockQuery,
        ROLES.CUSTOMER
      );

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const mockData = { name: 'Updated Category' };
      const mockUpdated = { id: 1, name: 'Updated Category', isActive: true };

      vi.mocked(CategoryValidators.validateCategoryUpdate).mockResolvedValue(
        undefined
      );
      vi.mocked(categoryRepository.update).mockResolvedValue(
        mockUpdated as any
      );

      const result = await CategoryService.updateCategory(
        1,
        mockData,
        ROLES.ADMIN
      );

      expect(CategoryValidators.validateCategoryUpdate).toHaveBeenCalledWith(
        1,
        mockData,
        ROLES.ADMIN
      );
      expect(categoryRepository.update).toHaveBeenCalledWith(1, mockData);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw error when validation fails', async () => {
      const mockData = { name: 'Updated Category' };
      const validationError = new ApiError(
        'VALIDATION_ERROR',
        400,
        'INVALID_REQUEST_BODY',
        'Validation failed'
      );

      vi.mocked(CategoryValidators.validateCategoryUpdate).mockRejectedValue(
        validationError
      );

      await expect(
        CategoryService.updateCategory(1, mockData, ROLES.CUSTOMER)
      ).rejects.toThrow(validationError);

      expect(categoryRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const mockDeleted = {
        id: 1,
        name: 'Deleted Category',
        isActive: false,
        deletedAt: '2023-01-01',
      };

      vi.mocked(CategoryValidators.validateCategoryDeletion).mockResolvedValue(
        undefined
      );
      vi.mocked(categoryRepository.softDelete).mockResolvedValue(
        mockDeleted as any
      );

      const result = await CategoryService.deleteCategory(1, ROLES.ADMIN);

      expect(CategoryValidators.validateCategoryDeletion).toHaveBeenCalledWith(
        1,
        ROLES.ADMIN
      );
      expect(categoryRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDeleted);
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ApiError(
        'FORBIDDEN',
        403,
        'INVALID_USER_ROLE',
        'Only administrators can perform this action'
      );

      vi.mocked(CategoryValidators.validateCategoryDeletion).mockRejectedValue(
        validationError
      );

      await expect(
        CategoryService.deleteCategory(1, ROLES.CUSTOMER)
      ).rejects.toThrow(validationError);

      expect(categoryRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('getActiveCategories', () => {
    it('should get active categories successfully', async () => {
      const mockCategories = [
        { id: 1, name: 'Active Category 1' },
        { id: 2, name: 'Active Category 2' },
      ];

      vi.mocked(categoryRepository.getActiveCategories).mockResolvedValue(
        mockCategories as any
      );

      const result = await CategoryService.getActiveCategories(ROLES.CUSTOMER);

      expect(categoryRepository.getActiveCategories).toHaveBeenCalledWith(
        ROLES.CUSTOMER
      );
      expect(result).toEqual(mockCategories);
    });

    it('should handle empty active categories', async () => {
      vi.mocked(categoryRepository.getActiveCategories).mockResolvedValue([]);

      const result = await CategoryService.getActiveCategories(ROLES.CUSTOMER);

      expect(result).toEqual([]);
    });
  });

  describe('categoryExists', () => {
    it('should return true when category exists and is accessible', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(true);

      const result = await CategoryService.categoryExists(1, ROLES.CUSTOMER);

      expect(categoryRepository.existsAndAccessible).toHaveBeenCalledWith(
        1,
        ROLES.CUSTOMER
      );
      expect(result).toBe(true);
    });

    it('should return false when category does not exist or is not accessible', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(
        false
      );

      const result = await CategoryService.categoryExists(999, ROLES.CUSTOMER);

      expect(categoryRepository.existsAndAccessible).toHaveBeenCalledWith(
        999,
        ROLES.CUSTOMER
      );
      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors in createCategory', async () => {
      const mockData = { name: 'New Category' };
      const repositoryError = new Error('Database connection failed');

      vi.mocked(CategoryValidators.validateCategoryCreation).mockResolvedValue(
        undefined
      );
      vi.mocked(categoryRepository.create).mockRejectedValue(repositoryError);

      await expect(
        CategoryService.createCategory(mockData, ROLES.ADMIN)
      ).rejects.toThrow(repositoryError);
    });

    it('should propagate repository errors in listCategories', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const repositoryError = new Error('Database query failed');

      vi.mocked(categoryRepository.list).mockRejectedValue(repositoryError);

      await expect(
        CategoryService.listCategories(mockQuery, ROLES.CUSTOMER)
      ).rejects.toThrow(repositoryError);
    });

    it('should propagate repository errors in updateCategory', async () => {
      const mockData = { name: 'Updated Category' };
      const repositoryError = new Error('Update failed');

      vi.mocked(CategoryValidators.validateCategoryUpdate).mockResolvedValue(
        undefined
      );
      vi.mocked(categoryRepository.update).mockRejectedValue(repositoryError);

      await expect(
        CategoryService.updateCategory(1, mockData, ROLES.ADMIN)
      ).rejects.toThrow(repositoryError);
    });
  });
});
