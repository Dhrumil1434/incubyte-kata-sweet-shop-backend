import { Router } from 'express';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/zodSchema.validator.middleware';
import { authenticateJwt, authRole } from '../middlewares';
import { CategoryController } from '../modules/sweet/category/category.controller';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryListQuerySchema,
} from '../modules/sweet/category/category.zod';
import { z } from 'zod';
import { ROLES } from '../common/constants';

const categoryRouter = Router();

// Validation schemas
const categoryIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// Public routes (no authentication required)
categoryRouter.get(
  '/',
  validateQuery(categoryListQuerySchema), // Validates pagination, sorting, filtering
  CategoryController.listCategories
);

categoryRouter.get(
  '/:id',
  validateParams(categoryIdSchema), // Validates ID parameter
  CategoryController.getCategoryById
);

categoryRouter.get('/active/list', CategoryController.getActiveCategories);

// Admin-only routes (authentication + admin role required)
categoryRouter.post(
  '/',
  authenticateJwt,
  authRole([ROLES.ADMIN]), // Only admin can create
  validateBody(categoryCreateSchema), // Validates create data
  CategoryController.createCategory
);

categoryRouter.put(
  '/:id',
  authenticateJwt,
  authRole([ROLES.ADMIN]), // Only admin can update
  validateParams(categoryIdSchema), // Validates ID parameter
  validateBody(categoryUpdateSchema), // Validates update data
  CategoryController.updateCategory
);

categoryRouter.delete(
  '/:id',
  authenticateJwt,
  authRole([ROLES.ADMIN]), // Only admin can delete
  validateParams(categoryIdSchema), // Validates ID parameter
  CategoryController.deleteCategory
);

categoryRouter.post(
  '/:id/reactivate',
  authenticateJwt,
  authRole([ROLES.ADMIN]), // Only admin can reactivate
  validateParams(categoryIdSchema), // Validates ID parameter
  CategoryController.reactivateCategory
);

export { categoryRouter };
