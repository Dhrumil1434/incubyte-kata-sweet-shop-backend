import { Router } from 'express';
import { z } from 'zod';
import { authenticateJwt, authRole } from '../middlewares';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/zodSchema.validator.middleware';
import { PurchaseController } from '../modules/purchase/purchase.controller';
import {
  purchaseCreateSchema,
  purchaseListQuerySchema,
} from '../modules/purchase/purchase.zod';
import { ROLES } from '../common/constants';

const purchaseRouter = Router();

// Common params schema for :id
const purchaseIdParams = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// User ID params schema
const userIdParams = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a number')
    .transform(Number),
});

// Sweet ID params schema
const sweetIdParams = z.object({
  sweetId: z
    .string()
    .regex(/^\d+$/, 'Sweet ID must be a number')
    .transform(Number),
});

// All endpoints are protected

// POST /api/purchases - create purchase (any authenticated user)
purchaseRouter.post(
  '/',
  authenticateJwt,
  validateBody(purchaseCreateSchema),
  PurchaseController.createPurchase
);

// GET /api/purchases - list purchases (any authenticated user - customers see only their own)
purchaseRouter.get(
  '/',
  authenticateJwt,
  validateQuery(purchaseListQuerySchema),
  PurchaseController.listPurchases
);

// GET /api/purchases/:id - get purchase by ID (any authenticated user - customers see only their own)
purchaseRouter.get(
  '/:id',
  authenticateJwt,
  validateParams(purchaseIdParams),
  PurchaseController.getPurchaseById
);

// GET /api/purchases/user/:userId - get purchases by user ID (admin only, or customers for their own ID)
purchaseRouter.get(
  '/user/:userId',
  authenticateJwt,
  validateParams(userIdParams),
  validateQuery(purchaseListQuerySchema),
  PurchaseController.getPurchasesByUser
);

// GET /api/purchases/sweet/:sweetId - get purchases by sweet ID (admin only)
purchaseRouter.get(
  '/sweet/:sweetId',
  authenticateJwt,
  authRole([ROLES.ADMIN]),
  validateParams(sweetIdParams),
  validateQuery(purchaseListQuerySchema),
  PurchaseController.getPurchasesBySweet
);

export { purchaseRouter };
