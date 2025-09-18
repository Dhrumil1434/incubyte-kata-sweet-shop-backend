import { z } from 'zod';

export const roleEnum = z.enum(['customer', 'admin']);

export const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: roleEnum.default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    role: roleEnum.optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
    path: [],
  });

export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .transform((v) => (v ? Number(v) : 1))
    .pipe(z.number().int().min(1))
    .optional(),
  limit: z
    .string()
    .transform((v) => (v ? Number(v) : 20))
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  search: z.string().max(255).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
