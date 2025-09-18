import { ApiError } from '../../utils';
import { userRepository } from './user.repository';
import { userApiMessage, userZodMessage } from './user.constants';
import { ACTIONS, ERROR_CODES, STATUS } from '../../common/errors.constants';

// Pure validators (no Express dependency). Controllers/services call these within asyncHandler.

export async function ensureUniqueEmail(email: string): Promise<void> {
  const trimmed = (email ?? '').toString().trim();
  if (!trimmed) {
    throw new ApiError(
      ACTIONS.VALIDATION_ERROR,
      STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_REQUEST_BODY,
      userZodMessage.EMAIL_REQUIRED
    );
  }
  const taken = await userRepository.isEmailTaken(trimmed);
  if (taken) {
    throw new ApiError(
      ACTIONS.VALIDATION_ERROR,
      STATUS.CONFLICT,
      ERROR_CODES.EMAIL_ALREADY_IN_USE,
      userApiMessage.EMAIL_EXISTS
    );
  }
}

export async function ensureUserExistsById(id: number) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(
      ACTIONS.VALIDATION_ERROR,
      STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_REQUEST_PARAMS,
      'A valid numeric user id is required'
    );
  }
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(
      ACTIONS.NOT_FOUND,
      STATUS.NOT_FOUND,
      ERROR_CODES.USER_NOT_FOUND,
      userApiMessage.NOT_FOUND
    );
  }
  return user;
}
