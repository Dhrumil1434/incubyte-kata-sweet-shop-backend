import { ApiResponse, asyncHandler } from '@utils-core';
import { Request, Response } from 'express';
import { registerSchema } from './user.zod';
import { ensureUniqueEmail } from './user.validators';
import { UserService } from './user.sevice';
import { StatusCodes } from 'http-status-codes';

export class UserController {
  static registerUser = asyncHandler(async (req: Request, res: Response) => {
    // parsing the data for better manipulation
    const userData = registerSchema.parse(req.body);
    // checkng that is there any email is already present with entered one
    await ensureUniqueEmail(userData.email);
    const registeredUser = await UserService.registerUser(userData);
    const response = new ApiResponse(
      StatusCodes.CREATED,
      registeredUser,
      'User created successfully'
    );
    res.status(response.statusCode).json(response);
  });
}
