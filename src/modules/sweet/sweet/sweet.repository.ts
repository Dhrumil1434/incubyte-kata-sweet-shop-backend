import { db } from '../../../db/mysql.db';
import { sweets, categories } from '../../../schema';
import { ISweetCreate, ISweetUpdate } from './sweet.zod';
import { ROLES } from '../../../common/constants';
import { and, eq, like, SQL, isNull, gte, lte, gt } from 'drizzle-orm';

export class SweetRepository {
  private table = sweets;
  private categoryTable = categories;

  /**
   * Check if sweet name is already taken
   * @param name - Sweet name to check
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
   * Update sweet by ID
   * @param id - Sweet ID
   * @param data - Update data
   */
  async update(id: number, data: ISweetUpdate) {
    const updateData = { ...data } as any;
    if (updateData.price !== undefined) {
      updateData.price = updateData.price.toString();
    }

    await db
      .update(this.table)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(this.table.id, id));

    // Fetch the updated record with category info
    const result = await this.findById(id);
    return result!;
  }

  /**
   * Soft delete sweet by ID
   * @param id - Sweet ID
   */
  async softDelete(id: number) {
    await db
      .update(this.table)
      .set({
        deletedAt: new Date().toISOString(),
        isActive: false,
      })
      .where(eq(this.table.id, id));

    // Fetch the deleted record with category info
    const result = await this.findById(id);
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
}

// Export singleton instance
export const sweetRepository = new SweetRepository();
