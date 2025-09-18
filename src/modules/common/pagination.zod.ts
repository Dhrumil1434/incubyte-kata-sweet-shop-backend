import { z } from 'zod';

export const paginationMetaSchema = z
  .object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(1),
  })
  .strict();

// Generic paginated response schema factory
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.object({
    success: z.boolean(),
    statusCode: z.number().int().positive(),
    data: z.object({
      items: z.array(itemSchema),
      meta: paginationMetaSchema,
    }),
    message: z.string(),
  });
}

// Type helper for paginated responses
export type PaginatedResponse<T> = {
  success: boolean;
  statusCode: number;
  data: {
    items: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
};
