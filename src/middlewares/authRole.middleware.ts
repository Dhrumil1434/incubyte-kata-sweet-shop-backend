import { NextFunction, Response, Request } from 'express';
import { ApiError } from '../utils/apiError.util';
import {
  ACTIONS,
  ERROR_CODES,
  ERROR_MESSAGES,
  STATUS,
} from '../common/errors.constants';
import { AuthRequest } from '../types/express';

// Usage: router.post('/admin', authenticateJwt, authRole(['admin']), handler)
export function authRole(allowed: ReadonlyArray<string>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
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
