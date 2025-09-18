import { Response } from 'express';
import { asyncHandler, ApiResponse } from '../../../utils';
import { createPaginatedResponse } from '../../../utils/paginatedResponse.util';
import { StatusCodes } from 'http-status-codes';
import { CategoryService } from './category.service';
import { ICategoryListQuery } from './category.zod';
import { categoryApiMessage } from './category.constants';
import { ROLES } from '../../../common/constants';
import { AuthRequest } from '../../../types/express';

export class CategoryController {
  /**
   * GET /api/categories - List categories with pagination and filtering
   */
  static listCategories = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const query = req.query as ICategoryListQuery;
      const userRole = req.user?.role || ROLES.CUSTOMER;

      const result = await CategoryService.listCategories(query, userRole);

      // Create paginated response
      const response = createPaginatedResponse(
        StatusCodes.OK,
        result.items,
        result.pagination,
        categoryApiMessage.FETCHED
      );

      response.send(res);
    }
  );

  /**
   * GET /api/categories/:id - Get category by ID
   */
  static getCategoryById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const userRole = req.user?.role || ROLES.CUSTOMER;

      const category = await CategoryService.getCategoryById(
        Number(id),
        userRole
      );

      const response = new ApiResponse(
        StatusCodes.OK,
        category,
        categoryApiMessage.FETCHED
      );

      res.status(response.statusCode).json(response);
    }
  );

  /**
   * POST /api/categories - Create new category (Admin only)
   */
  static createCategory = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const data = req.body;
      const userRole = req.user.role;

      const category = await CategoryService.createCategory(data, userRole);

      const response = new ApiResponse(
        StatusCodes.CREATED,
        category,
        categoryApiMessage.CREATED
      );

      res.status(response.statusCode).json(response);
    }
  );

  /**
   * PUT /api/categories/:id - Update category (Admin only)
   */
  static updateCategory = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const data = req.body;
      const userRole = req.user.role;

      const category = await CategoryService.updateCategory(
        Number(id),
        data,
        userRole
      );

      const response = new ApiResponse(
        StatusCodes.OK,
        category,
        categoryApiMessage.UPDATED
      );

      res.status(response.statusCode).json(response);
    }
  );

  /**
   * DELETE /api/categories/:id - Soft delete category (Admin only)
   */
  static deleteCategory = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const userRole = req.user.role;

      const category = await CategoryService.deleteCategory(
        Number(id),
        userRole
      );

      const response = new ApiResponse(
        StatusCodes.OK,
        category,
        'Category deleted successfully'
      );

      res.status(response.statusCode).json(response);
    }
  );

  /**
   * GET /api/categories/active - Get active categories for dropdowns
   */
  static getActiveCategories = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role || ROLES.CUSTOMER;

      const categories = await CategoryService.getActiveCategories(userRole);

      const response = new ApiResponse(
        StatusCodes.OK,
        categories,
        'Active categories fetched successfully'
      );

      res.status(response.statusCode).json(response);
    }
  );
}
