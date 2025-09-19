import { db } from '../../db/mysql.db';
import { purchases, sweets, users, categories } from '../../schema';
import { buildPagination, buildSort } from '../../utils/repository.util';
import { IPurchaseCreate, IPurchaseListQuery } from './purchase.zod';
import { ROLES } from '../../common/constants';
import { and, eq, SQL, desc, gte, lte } from 'drizzle-orm';

export class PurchaseRepository {
  private table = purchases;
  private sweetTable = sweets;
  private userTable = users;
  private categoryTable = categories;

  /**
   * Create a new purchase record
   * @param data - Purchase data
   */
  async create(data: IPurchaseCreate & { userId: number }) {
    const createData = {
      ...data,
      purchasedAt: new Date().toISOString(),
    };

    const [insertId] = await db.insert(this.table).values(createData);

    // Fetch the created record with related data
    const result = await this.findById(insertId.insertId);
    return result!;
  }

  /**
   * Find purchase by ID with related data
   * @param id - Purchase ID
   * @param userRole - User role to determine data visibility
   */
  async findById(id: number, userRole: string = ROLES.CUSTOMER) {
    const whereClause = this.buildRoleBasedWhere({ id }, userRole);

    const result = await db
      .select({
        id: this.table.id,
        userId: this.table.userId,
        sweetId: this.table.sweetId,
        quantity: this.table.quantity,
        purchasedAt: this.table.purchasedAt,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
        sweetTableId: this.sweetTable.id,
        sweetName: this.sweetTable.name,
        sweetPrice: this.sweetTable.price,
        categoryId: this.categoryTable.id,
        categoryName: this.categoryTable.name,
        userTableId: this.userTable.id,
        userName: this.userTable.name,
        userEmail: this.userTable.email,
      })
      .from(this.table)
      .leftJoin(this.sweetTable, eq(this.table.sweetId, this.sweetTable.id))
      .leftJoin(this.userTable, eq(this.table.userId, this.userTable.id))
      .leftJoin(
        this.categoryTable,
        eq(this.sweetTable.categoryId, this.categoryTable.id)
      )
      .where(whereClause)
      .limit(1);

    const item = result[0];
    return item ? this.transformPurchaseData(item) : null;
  }

  /**
   * List purchases with pagination, filtering, and sorting
   * @param query - Query parameters
   * @param userRole - User role to determine data visibility
   * @param requestingUserId - ID of the user making the request (for customer role)
   */
  async list(
    query: IPurchaseListQuery,
    userRole: string = ROLES.CUSTOMER,
    requestingUserId?: number
  ) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      userId,
      sweetId,
      startDate,
      endDate,
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
        ...(userId && { userId }),
        ...(userRole === ROLES.CUSTOMER &&
          requestingUserId && { userId: requestingUserId }),
        ...(sweetId && { sweetId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      userRole,
      requestingUserId
    );

    // Execute queries in parallel
    const [items, totalResult] = await Promise.all([
      // Get paginated items with related data
      db
        .select({
          id: this.table.id,
          userId: this.table.userId,
          sweetId: this.table.sweetId,
          quantity: this.table.quantity,
          purchasedAt: this.table.purchasedAt,
          createdAt: this.table.createdAt,
          updatedAt: this.table.updatedAt,
          sweetTableId: this.sweetTable.id,
          sweetName: this.sweetTable.name,
          sweetPrice: this.sweetTable.price,
          categoryId: this.categoryTable.id,
          categoryName: this.categoryTable.name,
          userTableId: this.userTable.id,
          userName: this.userTable.name,
          userEmail: this.userTable.email,
        })
        .from(this.table)
        .leftJoin(this.sweetTable, eq(this.table.sweetId, this.sweetTable.id))
        .leftJoin(this.userTable, eq(this.table.userId, this.userTable.id))
        .leftJoin(
          this.categoryTable,
          eq(this.sweetTable.categoryId, this.categoryTable.id)
        )
        .where(whereClause)
        .orderBy(orderBy || desc(this.table.purchasedAt))
        .limit(safeLimit)
        .offset(offset),

      // Get total count
      db
        .select({ count: this.table.id })
        .from(this.table)
        .leftJoin(this.sweetTable, eq(this.table.sweetId, this.sweetTable.id))
        .leftJoin(this.userTable, eq(this.table.userId, this.userTable.id))
        .leftJoin(
          this.categoryTable,
          eq(this.sweetTable.categoryId, this.categoryTable.id)
        )
        .where(whereClause),
    ]);

    const total = totalResult.length;

    return {
      items: items.map((item) => this.transformPurchaseData(item)),
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
   * Get purchases by user ID
   * @param userId - User ID
   * @param query - Query parameters
   * @param userRole - User role
   */
  async getPurchasesByUser(
    userId: number,
    query: IPurchaseListQuery,
    userRole: string = ROLES.CUSTOMER
  ) {
    return this.list({ ...query, userId }, userRole, userId);
  }

  /**
   * Get purchases by sweet ID
   * @param sweetId - Sweet ID
   * @param query - Query parameters
   * @param userRole - User role
   */
  async getPurchasesBySweet(
    sweetId: number,
    query: IPurchaseListQuery,
    userRole: string = ROLES.CUSTOMER
  ) {
    return this.list({ ...query, sweetId }, userRole);
  }

  /**
   * Build role-based where clause for data visibility
   * @param filters - Filter options
   * @param userRole - User role
   * @param requestingUserId - ID of the user making the request
   */
  private buildRoleBasedWhere(
    filters: {
      id?: number;
      userId?: number;
      sweetId?: number;
      startDate?: string;
      endDate?: string;
    },
    userRole: string,
    requestingUserId?: number
  ): SQL | undefined {
    const clauses: SQL[] = [];

    // ID filter
    if (filters.id) {
      clauses.push(eq(this.table.id, filters.id));
    }

    // User ID filter
    if (filters.userId) {
      clauses.push(eq(this.table.userId, filters.userId));
    }

    // Sweet ID filter
    if (filters.sweetId) {
      clauses.push(eq(this.table.sweetId, filters.sweetId));
    }

    // Date range filters
    if (filters.startDate) {
      clauses.push(gte(this.table.purchasedAt, filters.startDate));
    }
    if (filters.endDate) {
      clauses.push(lte(this.table.purchasedAt, filters.endDate));
    }

    // Role-based visibility rules
    if (userRole === ROLES.ADMIN) {
      // Admin can see all purchases
      // No additional restrictions
    } else {
      // Non-admin users (customers) can only see their own purchases
      if (requestingUserId) {
        clauses.push(eq(this.table.userId, requestingUserId));
      }
    }

    return clauses.length > 0 ? and(...clauses) : undefined;
  }

  /**
   * Check if purchase exists and is accessible by user
   * @param id - Purchase ID
   * @param userRole - User role
   * @param requestingUserId - ID of the user making the request
   */
  async existsAndAccessible(
    id: number,
    userRole: string = ROLES.CUSTOMER,
    requestingUserId?: number
  ): Promise<boolean> {
    const purchase = await this.findById(id, userRole);
    if (!purchase) return false;

    // For customers, ensure they can only access their own purchases
    if (
      userRole === ROLES.CUSTOMER &&
      requestingUserId &&
      purchase.userId !== requestingUserId
    ) {
      return false;
    }

    return true;
  }

  /**
   * Transform flattened database result to nested structure
   */
  private transformPurchaseData(item: any) {
    return {
      id: item.id,
      userId: item.userId,
      sweetId: item.sweetId,
      quantity: item.quantity,
      purchasedAt: item.purchasedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      sweet: {
        id: item.sweetTableId,
        name: item.sweetName,
        price: item.sweetPrice,
        category: {
          id: item.categoryId,
          name: item.categoryName,
        },
      },
      user: {
        id: item.userTableId,
        name: item.userName,
        email: item.userEmail,
      },
    };
  }
}

// Export singleton instance
export const purchaseRepository = new PurchaseRepository();
