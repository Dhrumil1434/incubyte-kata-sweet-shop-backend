import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError.util';
import {
  ACTIONS,
  ERROR_CODES,
  ERROR_MESSAGES,
  STATUS,
} from '../common/errors.constants';

// Usage: router.post('/admin', authenticateJwt, authRole(['admin']), handler)
export function authRole(allowed: ReadonlyArray<string>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(
        new ApiError(
          ACTIONS.VALIDATION_ERROR,
          STATUS.UNAUTHORIZED,
          ERROR_CODES.INVALID_REQUEST_BODY,
          'Unauthorized'
        )
      );
    }
    if (!user.role || !allowed.includes(user.role)) {
      return next(
        new ApiError(
          ACTIONS.VALIDATION_ERROR,
          STATUS.UNAUTHORIZED,
          ERROR_CODES.INVALID_USER_ROLE,
          ERROR_MESSAGES.INVALID_USER_ROLE
        )
      );
    }
    return next();
  };
}
