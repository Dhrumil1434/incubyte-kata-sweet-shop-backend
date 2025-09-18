import { Router } from 'express';
import { validateBody } from 'middlewares/zodSchema.validator.middleware';
import { UserController } from 'modules/user/user.controller';
import { loginSchema, registerSchema } from 'modules/user/user.zod';
import { authenticateJwt } from '../middlewares/authJwt.middleware';
import { authRole } from 'middlewares/authRole.middleware';
const router = Router();
router.post(
  '/register',
  validateBody(registerSchema),
  UserController.registerUser
);
router.post('/login', validateBody(loginSchema), UserController.loginUser);
router.get('/me', authenticateJwt, authRole(['admin']), (req, res) => {
  return res.json({
    statusCode: 200,
    success: true,
    data: { user: req.user },
    message: 'Authenticated',
  });
});
export default router;
