import { asyncHandler } from '@utils-core';
import { Request, Router } from 'express';
import { validateBody } from 'middlewares/zodSchema.validator.middleware';
import { registerSchema } from 'modules/user/user.zod';
const router = Router();
router.post(
  '/',
  validateBody(registerSchema),
  asyncHandler(async (req: Request) => {
    console.log(req.body);
  })
);
export default router;
