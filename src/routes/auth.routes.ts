import { Router, Response } from 'express';
import { validateBody } from 'middlewares/zodSchema.validator.middleware';
import { UserController } from 'modules/user/user.controller';
import { loginSchema, registerSchema } from 'modules/user/user.zod';
import { authenticateJwt } from '../middlewares/authJwt.middleware';
import { AuthRequest } from 'types/express';
import { asyncHandler } from '@utils-core';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validateBody(registerSchema),
  UserController.registerUser
);

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), UserController.loginUser);

// GET /api/auth/me - get current user info
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
