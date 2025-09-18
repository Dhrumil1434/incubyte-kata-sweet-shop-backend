export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
} as const;

export const MAX_PAGE_LIMIT = Number(process.env['MAX_PAGE_LIMIT'] ?? 100);
