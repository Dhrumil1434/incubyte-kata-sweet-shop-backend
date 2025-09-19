import { Response } from 'express';
import { SweetService } from './sweet.service';
import { asyncHandler, ApiResponse } from '../../utils';
import { StatusCodes } from 'http-status-codes';
import { ROLES } from '../../common/constants';
import { AuthRequest } from '../../types/express';
import {
  sweetCreateSchema,
  sweetId,
  sweetListQuerySchema,
  sweetSearchSchema,
  sweetUpdateSchema,
} from './sweet.zod';
import { SweetValidators } from './sweet.validator';
import { CategoryValidators } from './category/category.validators';

export class SweetController {
  static listSweets = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const queryParams = sweetListQuerySchema.parse(req.query);
    const result = await SweetService.listSweets(queryParams, userRole);
    const response = new ApiResponse(
      StatusCodes.OK,
      result,
      'Sweets fetched successfully'
    );
    res.status(response.statusCode).json(response);
  });

  static searchSweets = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      const searchQuery = sweetSearchSchema.parse(req.query);
      const items = await SweetService.searchSweets(searchQuery, userRole);
      const response = new ApiResponse(
        StatusCodes.OK,
        items,
        'Sweets fetched successfully'
      );
      res.status(response.statusCode).json(response);
    }
  );

  static getSweetById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole =
        req.user?.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CUSTOMER;
      const id = sweetId.parse(Number(req.params['id']));
      await SweetValidators.ensureSweetExists(id, userRole);
      const sweet = await SweetService.getSweetById(
        Number(req.params['id']),
        userRole
      );

      const response = new ApiResponse(
        StatusCodes.OK,
        sweet,
        'Sweet fetched successfully'
      );
      res.status(response.statusCode).json(response);
    }
  );

  static createSweet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role || ROLES.ADMIN;
    const data = sweetCreateSchema.parse(req.body);
    // here we have to first check about the exists by name
    await SweetValidators.isSweetAlreadyExistByName(data.name);
    // we would check that if category is active or not
    await CategoryValidators.ensureCategoryActive(data.categoryId, userRole);
    // we have to check that category which is entered is exists or not
    await CategoryValidators.ensureCategoryExists(data.categoryId, userRole);
    const created = await SweetService.createSweet(data, userRole);
    const response = new ApiResponse(
      StatusCodes.CREATED,
      created,
      'Sweet created successfully'
    );
    res.status(response.statusCode).json(response);
  });

  static updateSweet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const updatedData = sweetUpdateSchema.parse(req.body);
    const updatingSweetId = sweetId.parse(Number(req.params['id']));
    if (updatedData.name !== undefined) {
      await SweetValidators.isSweetAlreadyExistBeforeUpdate(
        updatedData.name,
        updatingSweetId
      );
    }
    if (updatedData.categoryId !== undefined) {
      await CategoryValidators.ensureCategoryActive(
        updatedData.categoryId,
        userRole
      );
      await CategoryValidators.ensureCategoryExists(
        updatedData.categoryId,
        userRole
      );
    }
    const updated = await SweetService.updateSweet(
      Number(req.params['id']),
      updatedData,
      userRole
    );
    const response = new ApiResponse(
      StatusCodes.OK,
      updated,
      'Sweet updated successfully'
    );
    res.status(response.statusCode).json(response);
  });

  static deleteSweet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole =
      req.user?.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CUSTOMER;
    const id = sweetId.parse(Number(req.params['id']));
    const deleted = await SweetService.deleteSweet(id, userRole);
    const response = new ApiResponse(
      StatusCodes.OK,
      deleted,
      'Sweet deleted successfully'
    );
    res.status(response.statusCode).json(response);
  });
}
