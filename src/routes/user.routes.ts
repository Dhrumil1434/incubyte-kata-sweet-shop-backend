import { Router } from 'express';
import { validateBody } from 'middlewares/zodSchema.validator.middleware';
import { UserController } from 'modules/user/user.controller';
import { loginSchema, registerSchema } from 'modules/user/user.zod';
const router = Router();
router.post(
  '/register',
  validateBody(registerSchema),
  UserController.registerUser
);
router.post('/login', validateBody(loginSchema), UserController.loginUser);
export default router;
