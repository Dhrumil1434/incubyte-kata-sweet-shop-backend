import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
} from '@utils-core';
import { ILoginInput, IRegisterInput, userResponseSchema } from './user.zod';
import { userRepository, UserRepository } from './user.repository';
import { ApiError } from '../../utils';
import { ACTIONS, ERROR_CODES, STATUS } from '../../common/errors.constants';

export class UserService {
  userRepository = new UserRepository();
  static async registerUser(userData: IRegisterInput) {
    const passwordHash = await hashPassword(userData.password);
    const { name, email, role } = userData;
    const created = await userRepository.createUser({
      name,
      email,
      role,
      passwordHash,
    });
    return created;
  }

  static async loginUser(loginData: ILoginInput) {
    const user = await userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.NOT_FOUND,
        ERROR_CODES.EMAIL_NOT_EXIST,
        'Kindly register yourself or check your credentials'
      );
    }
    const match = await verifyPassword(
      loginData.password,
      (user as any).passwordHash
    );
    if (!match) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_REQUEST_BODY,
        'Invalid email or password'
      );
    }
    const { passwordHash: _omit, ...sanitized } = user as any;
    const safeUser = userResponseSchema.parse(sanitized);
    const payload = { sub: String(safeUser.id), role: safeUser.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    return { user: safeUser, accessToken, refreshToken };
  }
}
