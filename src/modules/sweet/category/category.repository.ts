import { db } from '../../../db/mysql.db';
import { categories } from '../../../schema';
import { buildPagination, buildSort } from '../../../utils/repository.util';
import {
  ICategoryListQuery,
  ICategoryCreate,
  ICategoryUpdate,
} from './category.zod';
import { ROLES } from '../../../common/constants';
import { and, eq, like, SQL, isNull, desc, asc } from 'drizzle-orm';

export class CategoryRepository {
  private table = categories;

  /**
   * Check if category name is already taken
   * @param name - Category name to check
   * @param excludeId - Optional ID to exclude from check (for updates)
   */
  async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    const conditions = [eq(this.table.name, name)];
    if (excludeId) {
      conditions.push(eq(this.table.id, excludeId));
    }

    const result = await db
      .select({ id: this.table.id })
      .from(this.table)
      .where(and(...conditions))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Find category by ID with role-based visibility
   * @param id - Category ID
   * @param userRole - User role to determine data visibility
   */
  async findById(id: number, userRole: string = ROLES.CUSTOMER) {
    const whereClause = this.buildRoleBasedWhere({ id }, userRole);

    const result = await db
      .select()
      .from(this.table)
      .where(whereClause)
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find category by name with role-based visibility
   * @param name - Category name
   * @param userRole - User role to determine data visibility
   */
  async findByName(name: string, userRole: string = ROLES.CUSTOMER) {
    const whereClause = this.buildRoleBasedWhere({ name }, userRole);

    const result = await db
      .select()
      .from(this.table)
      .where(whereClause)
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new category
   * @param data - Category data
   */
  async create(data: ICategoryCreate) {
    const [insertId] = await db.insert(this.table).values(data);

    // Fetch the created record
    const result = await this.findById(insertId.insertId);
    return result!;
  }

  /**
   * Update category by ID
   * @param id - Category ID
   * @param data - Update data
   */
  async update(id: number, data: ICategoryUpdate) {
    await db
      .update(this.table)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(this.table.id, id));

    // Fetch the updated record
    const result = await this.findById(id);
    return result!;
  }

  /**
   * Soft delete category by ID
   * @param id - Category ID
   */
  async softDelete(id: number) {
    await db
      .update(this.table)
      .set({
        deletedAt: new Date().toISOString(),
        isActive: false,
      })
      .where(eq(this.table.id, id));

    // Fetch the deleted record
    const result = await this.findById(id);
    return result!;
  }

  /**
   * List categories with pagination, filtering, and sorting
   * @param query - Query parameters
   * @param userRole - User role to determine data visibility
   */
  async list(query: ICategoryListQuery, userRole: string = ROLES.CUSTOMER) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      name,
      search,
      is_active,
      includeDeleted,
    } = query;

    // Build pagination
    const { limit: safeLimit, offset } = buildPagination({
      page: page || 1,
      limit: limit || 20,
    });

    // Build sorting
    const orderBy = buildSort(this.table, sortBy, sortOrder);

    // Build role-based where clause
    const whereClause = this.buildRoleBasedWhere(
      {
        name: name || undefined,
        search: search || undefined,
        isActive: is_active,
        includeDeleted,
      },
      userRole
    );

    // Execute queries in parallel
    const [items, totalResult] = await Promise.all([
      // Get paginated items
      db
        .select()
        .from(this.table)
        .where(whereClause)
        .orderBy(orderBy || desc(this.table.createdAt))
        .limit(safeLimit)
        .offset(offset),

      // Get total count
      db.select({ count: this.table.id }).from(this.table).where(whereClause),
    ]);

    const total = totalResult.length;

    return {
      items,
      total,
      pagination: {
        page: page || 1,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  /**
   * Build role-based where clause for data visibility
   * @param filters - Filter options
   * @param userRole - User role
   */
  private buildRoleBasedWhere(
    filters: {
      id?: number;
      name?: string | undefined;
      search?: string | undefined;
      isActive?: boolean | undefined;
      includeDeleted?: boolean | undefined;
    },
    userRole: string
  ): SQL | undefined {
    const clauses: SQL[] = [];

    // ID filter
    if (filters.id) {
      clauses.push(eq(this.table.id, filters.id));
    }

    // Name filter (exact match)
    if (filters.name) {
      clauses.push(like(this.table.name, `%${filters.name}%`));
    }

    // Search filter (name search)
    if (filters.search) {
      clauses.push(like(this.table.name, `%${filters.search}%`));
    }

    // Role-based visibility rules
    if (userRole === ROLES.ADMIN) {
      // Admin can see all data based on their filters
      if (typeof filters.isActive === 'boolean') {
        clauses.push(eq(this.table.isActive, filters.isActive));
      }
      if (filters.includeDeleted !== true) {
        clauses.push(isNull(this.table.deletedAt));
      }
    } else {
      // Non-admin users (customers) can only see active, non-deleted data
      clauses.push(eq(this.table.isActive, true));
      clauses.push(isNull(this.table.deletedAt));
    }

    return clauses.length > 0 ? and(...clauses) : undefined;
  }

  /**
   * Get active categories only (for dropdowns, etc.)
   * @param userRole - User role
   */
  async getActiveCategories(userRole: string = ROLES.CUSTOMER) {
    const whereClause = this.buildRoleBasedWhere({ isActive: true }, userRole);

    return db
      .select({
        id: this.table.id,
        name: this.table.name,
      })
      .from(this.table)
      .where(whereClause)
      .orderBy(asc(this.table.name));
  }

  /**
   * Check if category exists and is accessible by user
   * @param id - Category ID
   * @param userRole - User role
   */
  async existsAndAccessible(
    id: number,
    userRole: string = ROLES.CUSTOMER
  ): Promise<boolean> {
    const category = await this.findById(id, userRole);
    return !!category;
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
