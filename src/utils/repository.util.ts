import { SQL, and, asc, desc, eq, isNull } from 'drizzle-orm';
import { MAX_PAGE_LIMIT, PAGINATION_DEFAULTS } from '../common/constants';

export type SortOrder = 'asc' | 'desc';
// following code is for centralizing the query options for all the repositories
export interface QueryOptions<TColumns> {
  page?: number;
  limit?: number;
  sortBy?: keyof TColumns | undefined;
  sortOrder?: SortOrder;
  is_active?: boolean;
  includeDeleted?: boolean; // if false, filters deleted_at IS NULL
}
// following would be helpful for pagination and sorting
/*for example:
const { limit, offset, currentPage } = buildPagination({ page, limit });
const orderBy = buildSort(users, sortBy, sortOrder);
const whereClause = buildActiveDeletedWhere(users, { is_active, includeDeleted });
*/
export function buildPagination({
  page = PAGINATION_DEFAULTS.PAGE,
  limit = PAGINATION_DEFAULTS.LIMIT,
}: {
  page?: number;
  limit?: number;
}) {
  const safeLimit = Math.max(1, Math.min(limit, MAX_PAGE_LIMIT));
  const currentPage = Math.max(1, page);
  const offset = (currentPage - 1) * safeLimit;
  return { limit: safeLimit, offset, currentPage };
}

export function buildSort<TColumns extends Record<string, any>>(
  columns: TColumns,
  sortBy?: keyof TColumns,
  sortOrder: SortOrder = 'desc'
) {
  if (!sortBy) return undefined;
  const col = columns[sortBy as string];
  if (!col) return undefined;
  return sortOrder === 'asc' ? asc(col) : desc(col);
}

export function buildActiveDeletedWhere<TColumns extends Record<string, any>>(
  columns: TColumns,
  opts?: {
    is_active?: boolean | undefined;
    includeDeleted?: boolean | undefined;
  }
): SQL | undefined {
  const clauses: SQL[] = [] as any;
  if (typeof opts?.is_active === 'boolean' && columns['is_active']) {
    clauses.push(eq(columns['is_active'], opts.is_active));
  }
  if (opts?.includeDeleted !== true && columns['deletedAt']) {
    clauses.push(isNull(columns['deletedAt']));
  }
  return clauses.length ? (and as any)(...clauses) : undefined;
}
