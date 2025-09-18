import { z } from 'zod';
import { helperColumnsSchema } from '../../../common/helpers.zod';
import { sweetZodMessage, sweetZodLimits } from './sweet.constants';
import { buildBaseQuerySchema } from 'modules/common/query.zod';
import { createPaginatedResponseSchema } from 'modules/common/pagination.zod';

// Field schemas
export const sweetId = z.number().int().positive();
export const sweetName = z
  .string()
  .min(2, sweetZodMessage.NAME_MIN)
  .max(255, sweetZodMessage.NAME_MAX)
  .regex(/^[A-Za-z][A-Za-z0-9\s.&-]*$/, sweetZodMessage.NAME_PATTERN);

export const sweetPrice = z
  .number()
  .positive(sweetZodMessage.PRICE_POSITIVE)
  .max(sweetZodLimits.PRICE_MAX, sweetZodMessage.PRICE_MAX)
  .transform((val) => Math.round(val * 100) / 100); // Round to 2 decimal places

export const sweetQuantity = z
  .number()
  .int()
  .min(0, sweetZodMessage.QUANTITY_NON_NEGATIVE)
  .max(sweetZodLimits.QUANTITY_MAX, sweetZodMessage.QUANTITY_MAX);

export const categoryId = z
  .number()
  .int()
  .positive('Category ID must be a positive number');

// Base schema (all fields)
const sweetBaseSchema = z.object({
  id: sweetId,
  name: sweetName,
  categoryId: categoryId,
  price: sweetPrice,
  quantity: sweetQuantity,
});

// Add helper columns
export const sweetSelectSchema = helperColumnsSchema
  .merge(sweetBaseSchema)
  .strict();

// Create schema: pick only the fields you allow on insert
export const sweetCreateSchema = sweetBaseSchema
  .pick({
    name: true,
    categoryId: true,
    price: true,
    quantity: true,
  })
  .strict();

// Update schema: allow optional fields (omit `id`)
export const sweetUpdateSchema = sweetBaseSchema
  .omit({
    id: true,
  })
  .partial() // make all remaining fields optional
  .refine((obj) => Object.keys(obj).length > 0, {
    message: sweetZodMessage.UPDATE_AT_LEAST_ONE,
  })
  .strict();

// Purchase schema: for purchasing sweets
export const sweetPurchaseSchema = z
  .object({
    quantity: z
      .number()
      .int()
      .positive('Purchase quantity must be greater than 0')
      .max(
        sweetZodLimits.PURCHASE_QUANTITY_MAX,
        `Purchase quantity cannot exceed ${sweetZodLimits.PURCHASE_QUANTITY_MAX}`
      ),
  })
  .strict();

// Restock schema: for restocking sweets (admin only)
export const sweetRestockSchema = z
  .object({
    quantity: z
      .number()
      .int()
      .positive('Restock quantity must be greater than 0')
      .max(
        sweetZodLimits.RESTOCK_QUANTITY_MAX,
        `Restock quantity cannot exceed ${sweetZodLimits.RESTOCK_QUANTITY_MAX}`
      ),
  })
  .strict();

// Sort keys available for sweets list
const sweetSortKeys = [
  'id',
  'name',
  'price',
  'quantity',
  'createdAt',
  'updatedAt',
] as const;

// Filters + pagination + sorting for sweets
export const sweetListQuerySchema = buildBaseQuerySchema(sweetSortKeys)
  .extend({
    name: z.string().max(255).optional(),
    category: z
      .string()
      .min(1, 'Category name is required')
      .max(255)
      .optional(),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
    inStock: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'Minimum price must be less than or equal to maximum price',
      path: ['maxPrice'],
    }
  );

// Search schema: for searching sweets
export const sweetSearchSchema = z
  .object({
    q: z.string().min(1, 'Search query is required').max(255),
    category: z
      .string()
      .min(1, 'Category name is required')
      .max(255)
      .optional(),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
    inStock: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'Minimum price must be less than or equal to maximum price',
      path: ['maxPrice'],
    }
  );

// Paginated response schema for sweets
export const sweetPaginatedResponseSchema =
  createPaginatedResponseSchema(sweetSelectSchema);

// Types
export type ISweetListQuery = z.infer<typeof sweetListQuerySchema>;
export type ISweetSearchQuery = z.infer<typeof sweetSearchSchema>;
export type ISweetSelect = z.infer<typeof sweetSelectSchema>;
export type ISweetCreate = z.infer<typeof sweetCreateSchema>;
export type ISweetUpdate = z.infer<typeof sweetUpdateSchema>;
export type ISweetPurchase = z.infer<typeof sweetPurchaseSchema>;
export type ISweetRestock = z.infer<typeof sweetRestockSchema>;
export type ISweetPaginatedResponse = z.infer<
  typeof sweetPaginatedResponseSchema
>;
