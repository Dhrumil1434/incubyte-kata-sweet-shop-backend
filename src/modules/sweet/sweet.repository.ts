import { db } from '../../db/mysql.db';
import { sweets, categories } from '../../schema';
import { buildPagination, buildSort } from '../../utils/repository.util';
import {
  ISweetListQuery,
  ISweetSearchQuery,
  ISweetCreate,
  ISweetUpdate,
} from './sweet.zod';
import { ROLES } from '../../common/constants';
import {
  and,
  eq,
  ne,
  like,
  SQL,
  isNull,
  desc,
  asc,
  gte,
  lte,
  gt,
} from 'drizzle-orm';

export class SweetRepository {
  private table = sweets;
  private categoryTable = categories;

  /**
   * Check if sweet name is already taken
   * @param name - Sweet name to check
   * @param excludeId - Optional ID to exclude from check (for updates)
   */
  async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    const conditions = [
      eq(this.table.name, name),
      isNull(this.table.deletedAt), // Only check active records
    ];

    if (excludeId) {
      conditions.push(ne(this.table.id, excludeId)); // Exclude the current record
    }

    const result = await db
      .select({ id: this.table.id })
      .from(this.table)
      .where(and(...conditions))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Find sweet by ID with role-based visibility
   * @param id - Sweet ID
   * @param userRole - User role to determine data visibility
   */
  async findById(id: number, userRole: string = ROLES.CUSTOMER) {
    const whereClause = this.buildRoleBasedWhere({ id }, userRole);

    const result = await db
      .select({
        id: this.table.id,
        name: this.table.name,
        categoryId: this.table.categoryId,
        price: this.table.price,
        quantity: this.table.quantity,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
        deletedAt: this.table.deletedAt,
        category: {
          id: this.categoryTable.id,
          name: this.categoryTable.name,
        },
      })
      .from(this.table)
      .leftJoin(
        this.categoryTable,
        eq(this.table.categoryId, this.categoryTable.id)
      )
      .where(whereClause)
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find sweet by ID including soft-deleted records (admin only)
   * @param id - Sweet ID
   */
  async findByIdIncludingDeleted(id: number) {
    const result = await db
      .select({
        id: this.table.id,
        name: this.table.name,
        categoryId: this.table.categoryId,
        price: this.table.price,
        quantity: this.table.quantity,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
        deletedAt: this.table.deletedAt,
        category: {
          id: this.categoryTable.id,
          name: this.categoryTable.name,
        },
      })
      .from(this.table)
      .leftJoin(
        this.categoryTable,
        eq(this.table.categoryId, this.categoryTable.id)
      )
      .where(eq(this.table.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find sweet by name with role-based visibility
   * @param name - Sweet name
   * @param userRole - User role to determine data visibility
   */
  async findByName(name: string, userRole: string = ROLES.CUSTOMER) {
    const whereClause = this.buildRoleBasedWhere({ name }, userRole);

    const result = await db
      .select({
        id: this.table.id,
        name: this.table.name,
        categoryId: this.table.categoryId,
        price: this.table.price,
        quantity: this.table.quantity,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
        deletedAt: this.table.deletedAt,
        category: {
          id: this.categoryTable.id,
          name: this.categoryTable.name,
        },
      })
      .from(this.table)
      .leftJoin(
        this.categoryTable,
        eq(this.table.categoryId, this.categoryTable.id)
      )
      .where(whereClause)
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new sweet
   * @param data - Sweet data
   */
  async create(data: ISweetCreate) {
    const createData = { ...data } as any;
    if (createData.price !== undefined) {
      createData.price = createData.price.toString();
    }

    const [insertId] = await db.insert(this.table).values(createData);

    // Fetch the created record with category info
    const result = await this.findById(insertId.insertId);
    return result!;
  }

  /**
   * Update sweet by ID with field synchronization
   * @param id - Sweet ID
   * @param data - Update data
   */
  async update(id: number, data: ISweetUpdate) {
    // First check if the record exists (including soft-deleted)
    const existingRecord = await this.findByIdIncludingDeleted(id);
    if (!existingRecord) {
      return null;
    }

    const updateData = { ...data } as any;
    if (updateData.price !== undefined) {
      updateData.price = updateData.price.toString();
    }

    // Note: isActive is not allowed in updates to prevent inconsistency
    // Use softDelete() for deletion and reactivate() for reactivation

    await db
      .update(this.table)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(this.table.id, id));

    // Fetch the updated record with category info
    const result = await this.findByIdIncludingDeleted(id);
    return result!;
  }

  /**
   * Soft delete sweet by ID
   * Sets both deletedAt and isActive: false for proper synchronization
   * @param id - Sweet ID
   */
  async softDelete(id: number) {
    // First check if the record exists and is not already deleted
    const existingRecord = await this.findById(id);
    if (!existingRecord) {
      return null;
    }

    // Check if already deleted
    if (existingRecord.deletedAt) {
      return null; // Already deleted
    }

    await db
      .update(this.table)
      .set({
        deletedAt: new Date().toISOString(),
        isActive: false, // Always set to false when soft-deleting
        updatedAt: new Date().toISOString(),
      })
      .where(eq(this.table.id, id));

    // Return the record as it was before deletion
    return existingRecord;
  }

  /**
   * Reactivate a soft-deleted sweet
   * Clears deletedAt and sets isActive: true
   * @param id - Sweet ID
   */
  async reactivate(id: number) {
    // First check if the record exists (including soft-deleted)
    const existingRecord = await this.findByIdIncludingDeleted(id);
    if (!existingRecord) {
      return null;
    }

    // Check if it's actually soft-deleted
    if (!existingRecord.deletedAt) {
      return null; // Not soft-deleted
    }

    await db
      .update(this.table)
      .set({
        deletedAt: null, // Clear deletion timestamp
        isActive: true, // Set as active
        updatedAt: new Date().toISOString(),
      })
      .where(eq(this.table.id, id));

    // Fetch the reactivated record with category info
    const result = await this.findByIdIncludingDeleted(id);
    return result!;
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
      categoryId?: number | undefined;
      categoryName?: string | undefined;
      minPrice?: number | undefined;
      maxPrice?: number | undefined;
      inStock?: boolean | undefined;
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

    // Category ID filter
    if (filters.categoryId) {
      clauses.push(eq(this.table.categoryId, filters.categoryId));
    }

    // Category name filter
    if (filters.categoryName) {
      clauses.push(like(this.categoryTable.name, `%${filters.categoryName}%`));
    }

    // Price range filters
    if (filters.minPrice !== undefined) {
      clauses.push(gte(this.table.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice !== undefined) {
      clauses.push(lte(this.table.price, filters.maxPrice.toString()));
    }

    // Stock availability filter
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        clauses.push(gt(this.table.quantity, 0));
      } else {
        clauses.push(eq(this.table.quantity, 0));
      }
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
   * Check if sweet exists and is accessible by user
   * @param id - Sweet ID
   * @param userRole - User role
   */
  async existsAndAccessible(
    id: number,
    userRole: string = ROLES.CUSTOMER
  ): Promise<boolean> {
    const sweet = await this.findById(id, userRole);
    return !!sweet;
  }

  /**
   * List sweets with pagination, filtering, and sorting
   * @param query - Query parameters
   * @param userRole - User role to determine data visibility
   */
  async list(query: ISweetListQuery, userRole: string = ROLES.CUSTOMER) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      name,
      category,
      minPrice,
      maxPrice,
      inStock,
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
        categoryName: category || undefined,
        minPrice,
        maxPrice,
        inStock,
        includeDeleted,
      },
      userRole
    );

    // Execute queries in parallel
    const [items, totalResult] = await Promise.all([
      // Get paginated items with category info
      db
        .select({
          id: this.table.id,
          name: this.table.name,
          categoryId: this.table.categoryId,
          price: this.table.price,
          quantity: this.table.quantity,
          isActive: this.table.isActive,
          createdAt: this.table.createdAt,
          updatedAt: this.table.updatedAt,
          deletedAt: this.table.deletedAt,
          category: {
            id: this.categoryTable.id,
            name: this.categoryTable.name,
          },
        })
        .from(this.table)
        .leftJoin(
          this.categoryTable,
          eq(this.table.categoryId, this.categoryTable.id)
        )
        .where(whereClause)
        .orderBy(orderBy || desc(this.table.createdAt))
        .limit(safeLimit)
        .offset(offset),

      // Get total count
      db
        .select({ count: this.table.id })
        .from(this.table)
        .leftJoin(
          this.categoryTable,
          eq(this.table.categoryId, this.categoryTable.id)
        )
        .where(whereClause),
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
   * Search sweets with pagination, filtering, and sorting
   * @param query - Search query parameters
   * @param userRole - User role to determine data visibility
   */
  async search(query: ISweetSearchQuery, userRole: string = ROLES.CUSTOMER) {
    const { q, category, minPrice, maxPrice, inStock } = query;

    // Build role-based where clause for search
    const whereClause = this.buildRoleBasedWhere(
      {
        search: q,
        categoryName: category || undefined,
        minPrice,
        maxPrice,
        inStock,
      },
      userRole
    );

    // Execute search query
    const items = await db
      .select({
        id: this.table.id,
        name: this.table.name,
        categoryId: this.table.categoryId,
        price: this.table.price,
        quantity: this.table.quantity,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
        deletedAt: this.table.deletedAt,
        category: {
          id: this.categoryTable.id,
          name: this.categoryTable.name,
        },
      })
      .from(this.table)
      .leftJoin(
        this.categoryTable,
        eq(this.table.categoryId, this.categoryTable.id)
      )
      .where(whereClause)
      .orderBy(desc(this.table.createdAt))
      .limit(50); // Limit search results to 50

    return items;
  }

  /**
   * Get sweets by category with pagination
   * @param categoryId - Category ID
   * @param query - Query parameters
   * @param userRole - User role to determine data visibility
   */
  async getSweetsByCategory(
    categoryId: number,
    query: ISweetListQuery,
    userRole: string = ROLES.CUSTOMER
  ) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      name,
      minPrice,
      maxPrice,
      inStock,
      includeDeleted,
    } = query;

    // Build pagination
    const { limit: safeLimit, offset } = buildPagination({
      page: page || 1,
      limit: limit || 20,
    });

    // Build sorting
    const orderBy = buildSort(this.table, sortBy, sortOrder);

    // Build role-based where clause with category filter
    const whereClause = this.buildRoleBasedWhere(
      {
        categoryId,
        name: name || undefined,
        minPrice,
        maxPrice,
        inStock,
        includeDeleted,
      },
      userRole
    );

    // Execute queries in parallel
    const [items, totalResult] = await Promise.all([
      // Get paginated items with category info
      db
        .select({
          id: this.table.id,
          name: this.table.name,
          categoryId: this.table.categoryId,
          price: this.table.price,
          quantity: this.table.quantity,
          isActive: this.table.isActive,
          createdAt: this.table.createdAt,
          updatedAt: this.table.updatedAt,
          deletedAt: this.table.deletedAt,
          category: {
            id: this.categoryTable.id,
            name: this.categoryTable.name,
          },
        })
        .from(this.table)
        .leftJoin(
          this.categoryTable,
          eq(this.table.categoryId, this.categoryTable.id)
        )
        .where(whereClause)
        .orderBy(orderBy || desc(this.table.createdAt))
        .limit(safeLimit)
        .offset(offset),

      // Get total count
      db
        .select({ count: this.table.id })
        .from(this.table)
        .leftJoin(
          this.categoryTable,
          eq(this.table.categoryId, this.categoryTable.id)
        )
        .where(whereClause),
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
   * Get active sweets only (for dropdowns, etc.)
   * @param userRole - User role
   */
  async getActiveSweets(userRole: string = ROLES.CUSTOMER) {
    const whereClause = this.buildRoleBasedWhere({ isActive: true }, userRole);

    return db
      .select({
        id: this.table.id,
        name: this.table.name,
        price: this.table.price,
        quantity: this.table.quantity,
        category: {
          id: this.categoryTable.id,
          name: this.categoryTable.name,
        },
      })
      .from(this.table)
      .leftJoin(
        this.categoryTable,
        eq(this.table.categoryId, this.categoryTable.id)
      )
      .where(whereClause)
      .orderBy(asc(this.table.name));
  }
}

// Export singleton instance
export const sweetRepository = new SweetRepository();
