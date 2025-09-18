import { z } from 'zod';
import {
  MAX_PAGE_LIMIT,
  PAGINATION_DEFAULTS,
  SORT_ORDER,
} from '../../common/constants';

export function buildBaseQuerySchema<TSortKeys extends readonly string[]>(
  sortKeys: TSortKeys
) {
  return z.object({
    page: z
      .string()
      .transform((v) => (v ? Number(v) : PAGINATION_DEFAULTS.PAGE))
      .pipe(z.number().int().min(1))
      .optional(),
    limit: z
      .string()
      .transform((v) => (v ? Number(v) : PAGINATION_DEFAULTS.LIMIT))
      .pipe(z.number().int().min(1).max(MAX_PAGE_LIMIT))
      .optional(),
    sortBy: z.enum(sortKeys).optional(),
    sortOrder: z.enum([SORT_ORDER.ASC, SORT_ORDER.DESC]).optional(),
    is_active: z
      .preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
      }, z.boolean())
      .optional(),
    includeDeleted: z
      .preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
      }, z.boolean())
      .optional(),
    search: z.string().max(255).optional(),
  });
}
