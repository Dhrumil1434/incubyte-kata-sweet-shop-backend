import { ApiError } from '@utils-core';
import { sweetRepository } from './sweet.repository';
import { ISweetSelect } from './sweet.zod';
import { ACTIONS } from 'common/errors.constants';
import { StatusCodes } from 'http-status-codes';
import { sweetApiMessage, sweetErrorCode } from './sweet.constants';

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
}
