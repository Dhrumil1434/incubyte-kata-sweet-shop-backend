import { Router } from 'express';
import { z } from 'zod';
import { authenticateJwt, authRole } from '../middlewares';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/zodSchema.validator.middleware';
import { SweetController } from '../modules/sweet/sweet.controller';
import {
  sweetCreateSchema,
  sweetUpdateSchema,
  sweetListQuerySchema,
  sweetSearchSchema,
} from '../modules/sweet/sweet.zod';
import { ROLES } from '../common/constants';

const sweetRouter = Router();

// Common params schema for :id
const sweetIdParams = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// All endpoints are protected

// GET /api/sweets - list sweets (any authenticated user)
sweetRouter.get(
  '/',
  authenticateJwt,
  validateQuery(sweetListQuerySchema),
  SweetController.listSweets
);

// GET /api/sweets/search - search sweets (any authenticated user)
sweetRouter.get(
  '/search',
  authenticateJwt,
  validateQuery(sweetSearchSchema),
  SweetController.searchSweets
);

// POST /api/sweets - create sweet (admin only)
sweetRouter.post(
  '/',
  authenticateJwt,
  authRole([ROLES.ADMIN]),
  validateBody(sweetCreateSchema),
  SweetController.createSweet
);

// PUT /api/sweets/:id - update sweet (admin only)
sweetRouter.put(
  '/:id',
  authenticateJwt,
  authRole([ROLES.ADMIN]),
  validateParams(sweetIdParams),
  validateBody(sweetUpdateSchema),
  SweetController.updateSweet
);

// DELETE /api/sweets/:id - delete sweet (admin only)
sweetRouter.delete(
  '/:id',
  authenticateJwt,
  authRole([ROLES.ADMIN]),
  validateParams(sweetIdParams),
  SweetController.deleteSweet
);

// POST /api/sweets/:id/reactivate - reactivate soft-deleted sweet (admin only)
sweetRouter.post(
  '/:id/reactivate',
  authenticateJwt,
  authRole([ROLES.ADMIN]),
  validateParams(sweetIdParams),
  SweetController.reactivateSweet
);

// POST /api/sweets/:id/purchase - purchase a sweet (any authenticated user)
sweetRouter.post(
  '/:id/purchase',
  authenticateJwt,
  validateParams(sweetIdParams),
  validateBody(z.object({ quantity: z.number().int().positive() })),
  SweetController.purchaseSweet
);

// POST /api/sweets/:id/restock - restock a sweet (admin only)
sweetRouter.post(
  '/:id/restock',
  authenticateJwt,
  authRole([ROLES.ADMIN]),
  validateParams(sweetIdParams),
  validateBody(z.object({ quantity: z.number().int().positive() })),
  SweetController.restockSweet
);

export { sweetRouter };
