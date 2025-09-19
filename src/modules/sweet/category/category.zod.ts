import { z } from 'zod';
import { helperColumnsSchema } from '../../../common/helpers.zod';
import { categoryZodMessage } from './category.constants';
import { buildBaseQuerySchema } from 'modules/common/query.zod';
import { createPaginatedResponseSchema } from 'modules/common/pagination.zod';

// Field schemas
export const categoryId = z.number().int().positive();
export const categoryName = z
  .string()
  .min(2, categoryZodMessage.NAME_MIN)
  .max(255, categoryZodMessage.NAME_MAX)
  .regex(/^[A-Za-z][A-Za-z0-9\s.&-]*$/, categoryZodMessage.NAME_PATTERN);

// Base schema (all fields)
const categoryBaseSchema = z.object({
  id: categoryId,
  name: categoryName,
  isActive: z.boolean().default(true),
});

// Add helper columns
export const categorySelectSchema = helperColumnsSchema
  .merge(categoryBaseSchema)
  .strict();

// Create schema: pick only the fields you allow on insert
export const categoryCreateSchema = categoryBaseSchema
  .pick({
    name: true, // only `name`
  })
  .strict();

// Update schema: allow optional fields (omit `id` and `isActive`)
export const categoryUpdateSchema = categoryBaseSchema
  .omit({
    id: true,
    isActive: true, // Remove isActive from updates to prevent inconsistency
  })
  .partial() // make all remaining fields optional
  .refine((obj) => Object.keys(obj).length > 0, {
    message: categoryZodMessage.UPDATE_AT_LEAST_ONE,
  })
  .strict();

// Sort keys available for categories list
const categorySortKeys = ['id', 'name', 'createdAt', 'updatedAt'] as const;

// Filters + pagination + sorting for categories
export const categoryListQuerySchema = buildBaseQuerySchema(
  categorySortKeys
).extend({
  name: z.string().max(255).optional(),
});

// Paginated response schema for categories
export const categoryPaginatedResponseSchema =
  createPaginatedResponseSchema(categorySelectSchema);

// Types
export type ICategoryListQuery = z.infer<typeof categoryListQuerySchema>;
export type ICategorySelect = z.infer<typeof categorySelectSchema>;
export type ICategoryCreate = z.infer<typeof categoryCreateSchema>;
export type ICategoryUpdate = z.infer<typeof categoryUpdateSchema>;
export type ICategoryPaginatedResponse = z.infer<
  typeof categoryPaginatedResponseSchema
>;
