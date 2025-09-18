import { Router } from 'express';
import { validateBody } from 'middlewares/zodSchema.validator.middleware';
import { UserController } from 'modules/user/user.controller';
import { registerSchema } from 'modules/user/user.zod';
const router = Router();
router.post('/', validateBody(registerSchema), UserController.registerUser);
export default router;
