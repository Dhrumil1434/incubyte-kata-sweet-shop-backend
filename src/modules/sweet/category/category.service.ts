import { categoryRepository } from './category.repository';
import {
  ICategoryListQuery,
  ICategoryCreate,
  ICategoryUpdate,
  categorySelectSchema,
} from './category.zod';
import { CategoryValidators } from './category.validators';

export class CategoryService {
  /**
   * Create a new category
   * @param data - Category data
   * @param userRole - User role (admin only)
   */
  static async createCategory(data: ICategoryCreate, userRole: string) {
    await CategoryValidators.validateCategoryCreation(data, userRole);
    const created = await categoryRepository.create(data);
    return categorySelectSchema.parse(created);
  }

  /**
   * Get category by ID with role-based access
   * @param id - Category ID
   * @param userRole - User role
   */
  static async getCategoryById(id: number, userRole: string) {
    // Use validator to ensure category exists and is accessible
    const category = await CategoryValidators.ensureCategoryExistsAndReturn(
      id,
      userRole
    );

    return categorySelectSchema.parse(category);
  }

  /**
   * List categories with role-based filtering
   * @param query - Query parameters
   * @param userRole - User role
   */
  static async listCategories(query: ICategoryListQuery, userRole: string) {
    const result = await categoryRepository.list(query, userRole);

    // Parse and sanitize items
    const sanitizedItems = result.items.map((item) =>
      categorySelectSchema.parse(item)
    );

    return {
      items: sanitizedItems,
      total: result.total,
      pagination: result.pagination,
    };
  }

  /**
   * Update category with role-based access
   * @param id - Category ID
   * @param data - Update data
   * @param userRole - User role (admin only)
   */
  static async updateCategory(
    id: number,
    data: ICategoryUpdate,
    userRole: string
  ) {
    await CategoryValidators.validateCategoryUpdate(id, data, userRole);
    const updated = await categoryRepository.update(id, data);
    return categorySelectSchema.parse(updated);
  }

  /**
   * Soft delete category with role-based access
   * @param id - Category ID
   * @param userRole - User role (admin only)
   */
  static async deleteCategory(id: number, userRole: string) {
    // Validate deletion using validators
    await CategoryValidators.validateCategoryDeletion(id, userRole);

    // Soft delete category
    const deleted = await categoryRepository.softDelete(id);

    return categorySelectSchema.parse(deleted);
  }

  /**
   * Get active categories for dropdowns/selects
   * @param userRole - User role
   */
  static async getActiveCategories(userRole: string) {
    return categoryRepository.getActiveCategories(userRole);
  }

  /**
   * Check if category exists and is accessible
   * @param id - Category ID
   * @param userRole - User role
   */
  static async categoryExists(id: number, userRole: string): Promise<boolean> {
    return categoryRepository.existsAndAccessible(id, userRole);
  }
}
