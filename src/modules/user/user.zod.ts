import { z } from 'zod';
import {
  MAX_PAGE_LIMIT,
  PAGINATION_DEFAULTS,
  ROLES,
  SORT_ORDER,
} from '../../common/constants';
import { userZodMessage } from './user.constants';

export const roleEnum = z.enum([ROLES.CUSTOMER, ROLES.ADMIN]);

export const registerSchema = z.object({
  name: z.string().min(1, userZodMessage.NAME_REQUIRED).max(255),
  email: z.string().email(userZodMessage.EMAIL_INVALID).max(255),
  password: z
    .string()
    .min(8, userZodMessage.PASSWORD_WEAK)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
      userZodMessage.PASSWORD_COMPLEXITY
    ),
  role: roleEnum.default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email(userZodMessage.EMAIL_INVALID),
  password: z.string().min(8, userZodMessage.PASSWORD_WEAK),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    role: roleEnum.optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: userZodMessage.UPDATE_AT_LEAST_ONE,
    path: [],
  });

export const listUsersQuerySchema = z.object({
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
  search: z.string().max(255, userZodMessage.SEARCH_TOO_LONG).optional(),
  sortBy: z
    .enum(['id', 'name', 'email', 'created_at', 'updated_at'])
    .optional(),
  sortOrder: z
    .enum([SORT_ORDER.ASC, SORT_ORDER.DESC])
    .default(SORT_ORDER.DESC)
    .optional(),
});

export type IRegisterInput = z.infer<typeof registerSchema>;
export type ILoginInput = z.infer<typeof loginSchema>;
export type IUpdateUserInput = z.infer<typeof updateUserSchema>;
export type IListUsersQuery = z.infer<typeof listUsersQuerySchema>;
