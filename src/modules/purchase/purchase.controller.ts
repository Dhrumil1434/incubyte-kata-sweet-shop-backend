import { Response } from 'express';
import { PurchaseService } from './purchase.service';
import { asyncHandler, ApiResponse } from '../../utils';
import { StatusCodes } from 'http-status-codes';
import { ROLES } from '../../common/constants';
import { AuthRequest } from '../../types/express';
import {
  purchaseCreateSchema,
  purchaseId,
  purchaseListQuerySchema,
} from './purchase.zod';
import { purchaseApiMessage } from './purchase.constants';

export class PurchaseController {
  static createPurchase = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        const response = new ApiResponse(
          StatusCodes.UNAUTHORIZED,
          null,
          'User not authenticated'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const userRole = req.user?.role || ROLES.CUSTOMER;
      const data = purchaseCreateSchema.parse(req.body);

      const purchase = await PurchaseService.createPurchase(
        data,
        userId,
        userRole
      );
      const response = new ApiResponse(
        StatusCodes.CREATED,
        purchase,
        purchaseApiMessage.CREATED
      );
      res.status(response.statusCode).json(response);
    }
  );

  static getPurchaseById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      const requestingUserId = req.user?.id;
      const id = purchaseId.parse(Number(req.params['id']));

      const purchase = await PurchaseService.getPurchaseById(
        id,
        userRole,
        requestingUserId
      );
      const response = new ApiResponse(
        StatusCodes.OK,
        purchase,
        purchaseApiMessage.FETCHED
      );
      res.status(response.statusCode).json(response);
    }
  );

  static listPurchases = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      const requestingUserId = req.user?.id;
      const query = purchaseListQuerySchema.parse(req.query);

      const result = await PurchaseService.listPurchases(
        query,
        userRole,
        requestingUserId
      );
      const response = new ApiResponse(
        StatusCodes.OK,
        result,
        purchaseApiMessage.LIST_FETCHED
      );
      res.status(response.statusCode).json(response);
    }
  );

  static getPurchasesByUser = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      const requestingUserId = req.user?.id;
      const userId = purchaseId.parse(Number(req.params['userId']));
      const query = purchaseListQuerySchema.parse(req.query);

      const result = await PurchaseService.getPurchasesByUser(
        userId,
        query,
        userRole,
        requestingUserId
      );
      const response = new ApiResponse(
        StatusCodes.OK,
        result,
        purchaseApiMessage.LIST_FETCHED
      );
      res.status(response.statusCode).json(response);
    }
  );

  static getPurchasesBySweet = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      const sweetId = purchaseId.parse(Number(req.params['sweetId']));
      const query = purchaseListQuerySchema.parse(req.query);

      const result = await PurchaseService.getPurchasesBySweet(
        sweetId,
        query,
        userRole
      );
      const response = new ApiResponse(
        StatusCodes.OK,
        result,
        purchaseApiMessage.LIST_FETCHED
      );
      res.status(response.statusCode).json(response);
    }
  );
}
