import { z } from 'zod';

// Common column shapes reused across response DTOs (camelCase to match drizzle result mapping)
export const helperColumnsSchema = z.object({
  isActive: z.boolean().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  deletedAt: z.union([z.string(), z.date(), z.null()]).optional(),
});

export type IHelperColumns = z.infer<typeof helperColumnsSchema>;
