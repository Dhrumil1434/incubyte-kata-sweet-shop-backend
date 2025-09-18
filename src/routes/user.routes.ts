import { Router, Response } from 'express';
import { validateBody } from 'middlewares/zodSchema.validator.middleware';
import { UserController } from 'modules/user/user.controller';
import { loginSchema, registerSchema } from 'modules/user/user.zod';
import { authenticateJwt } from '../middlewares/authJwt.middleware';
import { AuthRequest } from 'types/express';
import { asyncHandler } from '@utils-core';
const router = Router();
router.post(
  '/register',
  validateBody(registerSchema),
  UserController.registerUser
);
router.post('/login', validateBody(loginSchema), UserController.loginUser);
router.get(
  '/me',
  authenticateJwt,
  asyncHandler((req: AuthRequest, res: Response) => {
    res.json({
      statusCode: 200,
      success: true,
      data: { user: req.user },
      message: 'Authenticated',
    });
  })
);

export default router;
