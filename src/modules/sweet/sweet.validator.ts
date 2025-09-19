import { ApiError } from '@utils-core';
import { sweetRepository } from './sweet.repository';
import { ISweetSelect } from './sweet.zod';
import { ACTIONS, STATUS } from 'common/errors.constants';
import { StatusCodes } from 'http-status-codes';
import { sweetApiMessage, sweetErrorCode } from './sweet.constants';
import { IUserResponse } from 'modules/user/user.zod';

export class SweetValidators {
  //first validation function to check the unique ness of the sweet name at application layer
  static async isSweetAlreadyExistByName(name: ISweetSelect['name']) {
    const taken = await sweetRepository.isNameTaken(name);

    if (!taken) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        StatusCodes.CONFLICT,
        sweetErrorCode.SWEET_NAME_CONFLICT,
        sweetApiMessage.SWEET_NAME_CONFLICT
      );
    }
  }
  // second validator is to check that newly updating record doesnt collision with existing one
  static async isSweetAlreadyExistBeforeUpdate(
    name: ISweetSelect['name'],
    excludeId: ISweetSelect['id']
  ) {
    const taken = await sweetRepository.isNameTaken(name, excludeId);

    if (!taken) {
      if (!taken) {
        throw new ApiError(
          ACTIONS.VALIDATION_ERROR,
          StatusCodes.CONFLICT,
          sweetErrorCode.SWEET_NAME_UPDATE_CONFLICT,
          sweetApiMessage.SWEET_NAME_UPDATE_CONFLICT
        );
      }
    }
  }
  // validator to check that sweet exists or not
  static async ensureSweetExists(
    id: ISweetSelect['id'],
    userRole: IUserResponse['role']
  ) {
    const sweet = await sweetRepository.existsAndAccessible(id, userRole);
    if (!sweet) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        sweetErrorCode.SWEET_NOT_FOUND, // replace with SWEET_NOT_FOUND if you add it
        sweetApiMessage.NOT_FOUND
      );
    }
  }
}
