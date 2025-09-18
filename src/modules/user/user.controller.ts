import { ApiResponse, asyncHandler, setAuthCookies } from '@utils-core';
import { Request, Response } from 'express';
import { loginSchema, registerSchema, userResponseSchema } from './user.zod';
import { ensureUniqueEmail } from './user.validators';
import { UserService } from './user.sevice';
import { StatusCodes } from 'http-status-codes';
import { userApiMessage } from './user.constants';

export class UserController {
  static registerUser = asyncHandler(async (req: Request, res: Response) => {
    // parsing the data for better manipulation
    const userData = registerSchema.parse(req.body);
    // checkng that is there any email is already present with entered one
    await ensureUniqueEmail(userData.email);
    const registeredUser = await UserService.registerUser(userData);
    const safeUser = userResponseSchema.parse(registeredUser);
    const response = new ApiResponse(
      StatusCodes.CREATED,
      safeUser,
      userApiMessage.REGISTERED
    );
    res.status(response.statusCode).json(response);
  });

  // login function
  static loginUser = asyncHandler(async (req: Request, res: Response) => {
    const loginBody = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } =
      await UserService.loginUser(loginBody);
    setAuthCookies(res, accessToken, refreshToken);
    const response = new ApiResponse(
      StatusCodes.OK,
      { user, accessToken, refreshToken },
      userApiMessage.LOGGED_IN
    );
    res.status(response.statusCode).json(response);
  });
}
