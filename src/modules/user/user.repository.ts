import { and, eq, like, or, SQL, sql } from 'drizzle-orm';
import { db } from '../../db/mysql.db';
import { users } from '../../schema/users.schema';
import {
  buildActiveDeletedWhere,
  buildPagination,
  buildSort,
  QueryOptions,
} from '../../utils/repository.util';

export interface ListUsersFilters extends QueryOptions<typeof users> {
  search?: string;
}

export class UserRepository {
  // Check whether an email is already taken (used in register validation)
  async isEmailTaken(email: string): Promise<boolean> {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return existing.length > 0;
  }

  // Create a new user record (expects pre-hashed password)
  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: 'customer' | 'admin';
  }) {
    await db.insert(users).values(input);
    // Fetch only public fields (omit passwordHash)
    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    return row ?? null;
  }

  // Get a single user by unique email
  async findByEmail(email: string) {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return row ?? null;
  }

  // Get a single user by primary key id
  async findById(id: number) {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row ?? null;
  }

  // List users with pagination, sorting and common filters
  // - buildPagination: computes limit/offset
  // - buildActiveDeletedWhere: adds is_active and soft-delete filters
  // - buildSort: converts sortBy/sortOrder into drizzle orderBy
  async list(filters: ListUsersFilters) {
    const { currentPage, limit, offset } = buildPagination(filters);

    const whereParts: SQL[] = [] as any;

    const activeDeletedWhere = buildActiveDeletedWhere(users, {
      is_active: filters.is_active ?? undefined,
      includeDeleted: filters.includeDeleted ?? undefined,
    });
    if (activeDeletedWhere) whereParts.push(activeDeletedWhere as any);

    if (filters.search) {
      const term = `%${filters.search}%`;
      whereParts.push(
        or(like(users.name, term), like(users.email, term)) as any
      );
    }

    const whereClause = whereParts.length
      ? ((and as any)(...whereParts) as SQL)
      : undefined;

    // total count
    let countQuery = db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(users) as any;
    if (whereClause) countQuery = countQuery.where(whereClause);
    const counted = (await countQuery) as Array<{ count: number }> | undefined;
    const count = counted && counted.length > 0 ? counted[0]!.count : 0;

    const orderBy = buildSort(users, filters.sortBy, filters.sortOrder);

    let listQuery = db.select().from(users) as any;
    if (whereClause) listQuery = listQuery.where(whereClause);
    if (orderBy) listQuery = listQuery.orderBy(orderBy);
    const rows = await listQuery.limit(limit).offset(offset);

    return {
      items: rows,
      meta: {
        page: currentPage,
        limit,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
      },
    };
  }

  // Update mutable user fields
  async update(
    id: number,
    data: Partial<{
      name: string;
      role: 'customer' | 'admin';
      is_active: boolean;
    }>
  ) {
    const res = await db.update(users).set(data).where(eq(users.id, id));
    return res;
  }

  // Soft delete: mark inactive and set deletedAt
  async softDelete(id: number) {
    const res = await db
      .update(users)
      .set({ isActive: false, deletedAt: new Date().toISOString() as any })
      .where(eq(users.id, id));
    return res;
  }
}

export const userRepository = new UserRepository();
