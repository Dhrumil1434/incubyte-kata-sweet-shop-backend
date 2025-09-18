import { NextFunction, Request, Response } from 'express';
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from '../utils';
import { asyncHandler } from '../utils/asyncHandler.util';
import { ApiError } from '../utils/apiError.util';
import { ACTIONS, ERROR_CODES, STATUS } from '../common/errors.constants';

function getBearer(req: Request): string | undefined {
  const h = req.headers['authorization'];
  if (!h) return undefined;
  const [scheme, token] = h.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;
  return token;
}

export const authenticateJwt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessFromHeader = getBearer(req);
    const accessFromCookie = (req as any).cookies?.accessToken as
      | string
      | undefined;
    const refreshToken = (req as any).cookies?.refreshToken as
      | string
      | undefined;

    const accessToken = accessFromHeader || accessFromCookie;

    if (!accessToken && !refreshToken) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_REQUEST_BODY,
        'Missing authentication tokens'
      );
    }

    // Try verify access token first
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        (req as any).user = { id: payload.sub, role: payload.role };
        return next();
      } catch (err: any) {
        // fallthrough to refresh flow only if token expired
        if (!refreshToken || err?.name !== 'TokenExpiredError') {
          throw new ApiError(
            ACTIONS.VALIDATION_ERROR,
            STATUS.UNAUTHORIZED,
            ERROR_CODES.INVALID_REQUEST_BODY,
            'Invalid or expired access token'
          );
        }
      }
    }

    // Access token missing or expired: try refresh
    if (refreshToken) {
      try {
        const rPayload = verifyRefreshToken(refreshToken);
        if (!rPayload.sub) {
          throw new Error('missing sub');
        }
        const accessPayload: any = { sub: String(rPayload.sub) };
        if (rPayload.role) accessPayload.role = String(rPayload.role);
        const newAccess = signAccessToken(accessPayload);
        // Optional rotation: create new refresh token
        const rotate = process.env['ROTATE_REFRESH_TOKENS'] === 'true';
        const newRefresh = rotate
          ? signRefreshToken(accessPayload)
          : refreshToken;
        setAuthCookies(res, newAccess, newRefresh);
        (req as any).user = { id: rPayload.sub, role: rPayload.role };
        return next();
      } catch {
        throw new ApiError(
          ACTIONS.VALIDATION_ERROR,
          STATUS.UNAUTHORIZED,
          ERROR_CODES.INVALID_REQUEST_BODY,
          'Invalid refresh token'
        );
      }
    }

    throw new ApiError(
      ACTIONS.VALIDATION_ERROR,
      STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_REQUEST_BODY,
      'Unauthorized'
    );
  }
);
