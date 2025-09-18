import { hashPassword } from '@utils-core';
import { IRegisterInput } from './user.zod';
import { userRepository, UserRepository } from './user.repository';

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
}
