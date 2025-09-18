import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryValidators } from '../category.validators';
import { categoryRepository } from '../category.repository';
import { ApiError } from '../../../../utils';
import { ROLES } from '../../../../common/constants';

// Mock the category repository
vi.mock('../category.repository', () => ({
  categoryRepository: {
    isNameTaken: vi.fn(),
    existsAndAccessible: vi.fn(),
    findById: vi.fn(),
  },
}));

describe('CategoryValidators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureUniqueName', () => {
    it('should pass when name is unique', async () => {
      vi.mocked(categoryRepository.isNameTaken).mockResolvedValue(false);

      await expect(
        CategoryValidators.ensureUniqueName('New Category')
      ).resolves.not.toThrow();
    });

    it('should throw 409 when name is already taken', async () => {
      vi.mocked(categoryRepository.isNameTaken).mockResolvedValue(true);

      await expect(
        CategoryValidators.ensureUniqueName('Existing Category')
      ).rejects.toThrow(ApiError);
    });

    it('should pass when name is unique with excludeId', async () => {
      vi.mocked(categoryRepository.isNameTaken).mockResolvedValue(false);

      await expect(
        CategoryValidators.ensureUniqueName('Updated Category', 1)
      ).resolves.not.toThrow();
    });
  });

  describe('ensureCategoryExists', () => {
    it('should pass when category exists and is accessible', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(true);

      await expect(
        CategoryValidators.ensureCategoryExists(1, ROLES.CUSTOMER)
      ).resolves.not.toThrow();
    });

    it('should throw 404 when category does not exist', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(
        false
      );

      await expect(
        CategoryValidators.ensureCategoryExists(999, ROLES.CUSTOMER)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('ensureCategoryExistsAndReturn', () => {
    it('should return category when exists and accessible', async () => {
      const mockCategory = { id: 1, name: 'Test Category', isActive: true };
      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any
      );

      const result = await CategoryValidators.ensureCategoryExistsAndReturn(
        1,
        ROLES.CUSTOMER
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw 404 when category does not exist', async () => {
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      await expect(
        CategoryValidators.ensureCategoryExistsAndReturn(999, ROLES.CUSTOMER)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('validateCategoryUpdate', () => {
    it('should pass when category exists and name is unique', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(true);
      vi.mocked(categoryRepository.isNameTaken).mockResolvedValue(false);

      await expect(
        CategoryValidators.validateCategoryUpdate(
          1,
          { name: 'Updated Name' },
          ROLES.CUSTOMER
        )
      ).resolves.not.toThrow();
    });

    it('should throw 404 when category does not exist', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(
        false
      );

      await expect(
        CategoryValidators.validateCategoryUpdate(
          999,
          { name: 'Updated Name' },
          ROLES.CUSTOMER
        )
      ).rejects.toThrow(ApiError);
    });

    it('should throw 409 when new name is already taken', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(true);
      vi.mocked(categoryRepository.isNameTaken).mockResolvedValue(true);

      await expect(
        CategoryValidators.validateCategoryUpdate(
          1,
          { name: 'Existing Name' },
          ROLES.CUSTOMER
        )
      ).rejects.toThrow(ApiError);
    });
  });

  describe('ensureAdminRole', () => {
    it('should pass when user is admin', () => {
      expect(() =>
        CategoryValidators.ensureAdminRole(ROLES.ADMIN)
      ).not.toThrow();
    });

    it('should throw 403 when user is not admin', () => {
      expect(() => CategoryValidators.ensureAdminRole(ROLES.CUSTOMER)).toThrow(
        ApiError
      );
    });
  });

  describe('ensureCategoryNotDeleted', () => {
    it('should pass when category is not deleted', async () => {
      const mockCategory = { id: 1, name: 'Test', deletedAt: null };
      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any
      );

      await expect(
        CategoryValidators.ensureCategoryNotDeleted(1, ROLES.CUSTOMER)
      ).resolves.not.toThrow();
    });

    it('should throw 400 when category is deleted', async () => {
      const mockCategory = { id: 1, name: 'Test', deletedAt: '2023-01-01' };
      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any
      );

      await expect(
        CategoryValidators.ensureCategoryNotDeleted(1, ROLES.CUSTOMER)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('ensureCategoryActive', () => {
    it('should pass when category is active', async () => {
      const mockCategory = { id: 1, name: 'Test', isActive: true };
      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any
      );

      await expect(
        CategoryValidators.ensureCategoryActive(1, ROLES.CUSTOMER)
      ).resolves.not.toThrow();
    });

    it('should throw 400 when category is inactive', async () => {
      const mockCategory = { id: 1, name: 'Test', isActive: false };
      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any
      );

      await expect(
        CategoryValidators.ensureCategoryActive(1, ROLES.CUSTOMER)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('validateCategoryCreation', () => {
    it('should pass when user is admin and name is unique', async () => {
      vi.mocked(categoryRepository.isNameTaken).mockResolvedValue(false);

      await expect(
        CategoryValidators.validateCategoryCreation(
          { name: 'New Category' },
          ROLES.ADMIN
        )
      ).resolves.not.toThrow();
    });

    it('should throw 403 when user is not admin', async () => {
      await expect(
        CategoryValidators.validateCategoryCreation(
          { name: 'New Category' },
          ROLES.CUSTOMER
        )
      ).rejects.toThrow(ApiError);
    });
  });

  describe('validateBulkCategoryAccess', () => {
    it('should pass when all categories exist and are accessible', async () => {
      vi.mocked(categoryRepository.existsAndAccessible).mockResolvedValue(true);

      await expect(
        CategoryValidators.validateBulkCategoryAccess([1, 2, 3], ROLES.CUSTOMER)
      ).resolves.not.toThrow();
    });

    it('should throw 404 when some categories do not exist', async () => {
      vi.mocked(categoryRepository.existsAndAccessible)
        .mockResolvedValueOnce(true) // ID 1 exists
        .mockResolvedValueOnce(false) // ID 2 doesn't exist
        .mockResolvedValueOnce(true); // ID 3 exists

      await expect(
        CategoryValidators.validateBulkCategoryAccess([1, 2, 3], ROLES.CUSTOMER)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('validateCategoryStatusChange', () => {
    it('should pass when changing from active to inactive', async () => {
      const mockCategory = { id: 1, name: 'Test', isActive: true };
      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any
      );

      await expect(
        CategoryValidators.validateCategoryStatusChange(1, false, ROLES.ADMIN)
      ).resolves.not.toThrow();
    });

    it('should throw 403 when user is not admin', async () => {
      await expect(
        CategoryValidators.validateCategoryStatusChange(
          1,
          false,
          ROLES.CUSTOMER
        )
      ).rejects.toThrow(ApiError);
    });

    it('should throw 400 when trying to deactivate already inactive category', async () => {
      const mockCategory = { id: 1, name: 'Test', isActive: false };
      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any
      );

      await expect(
        CategoryValidators.validateCategoryStatusChange(1, false, ROLES.ADMIN)
      ).rejects.toThrow(ApiError);
    });
  });
});
