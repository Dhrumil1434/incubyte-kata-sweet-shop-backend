import { z } from 'zod';

// Purchase creation schema
export const purchaseCreateSchema = z.object({
  sweetId: z.number().int().positive('Sweet ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// Purchase response schema
export const purchaseResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  sweetId: z.number(),
  quantity: z.number(),
  purchasedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sweet: z
    .object({
      id: z.number(),
      name: z.string(),
      price: z.string(),
      category: z.object({
        id: z.number(),
        name: z.string(),
      }),
    })
    .optional(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

// Purchase list query schema
export const purchaseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(['id', 'purchasedAt', 'quantity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  userId: z.coerce.number().int().positive().optional(),
  sweetId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Purchase ID validation
export const purchaseId = z
  .number()
  .int()
  .positive('Purchase ID must be a positive integer');

// Type exports
export type IPurchaseCreate = z.infer<typeof purchaseCreateSchema>;
export type IPurchaseResponse = z.infer<typeof purchaseResponseSchema>;
export type IPurchaseListQuery = z.infer<typeof purchaseListQuerySchema>;
