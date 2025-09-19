import { Response } from 'express';
import { SweetService } from './sweet.service';
import { asyncHandler, ApiResponse } from '../../utils';
import { StatusCodes } from 'http-status-codes';
import { ROLES } from '../../common/constants';
import { AuthRequest } from '../../types/express';

export class SweetController {
  static listSweets = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const result = await SweetService.listSweets(req.query as any, userRole);

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
      const items = await SweetService.searchSweets(req.query as any, userRole);

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
      const userRole = req.user?.role || ROLES.CUSTOMER;
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
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const created = await SweetService.createSweet(req.body, userRole);
    const response = new ApiResponse(
      StatusCodes.CREATED,
      created,
      'Sweet created successfully'
    );
    res.status(response.statusCode).json(response);
  });

  static updateSweet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const updated = await SweetService.updateSweet(
      Number(req.params['id']),
      req.body,
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
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const deleted = await SweetService.deleteSweet(
      Number(req.params['id']),
      userRole
    );
    const response = new ApiResponse(
      StatusCodes.OK,
      deleted,
      'Sweet deleted successfully'
    );
    res.status(response.statusCode).json(response);
  });
}
