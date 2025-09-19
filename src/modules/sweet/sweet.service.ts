import { sweetRepository } from './sweet.repository';
import {
  sweetSelectResponseSchema,
  ISweetCreate,
  ISweetUpdate,
  ISweetListQuery,
  ISweetSearchQuery,
} from './sweet.zod';
import { ApiError } from '../../utils';
import { ACTIONS, STATUS } from '../../common/errors.constants';
import { sweetApiMessage, sweetErrorCode } from './sweet.constants';

export class SweetService {
  static async createSweet(data: ISweetCreate, _userRole: string) {
    const created = await sweetRepository.create(data);
    return sweetSelectResponseSchema.parse(created);
  }

  static async getSweetById(id: number, userRole: string) {
    const sweet = await sweetRepository.findById(id, userRole);
    return sweet ? sweetSelectResponseSchema.parse(sweet) : null;
  }

  static async listSweets(query: ISweetListQuery, userRole: string) {
    const result = await sweetRepository.list(query, userRole);
    return {
      items: result.items.map((i) => sweetSelectResponseSchema.parse(i)),
      total: result.total,
      pagination: result.pagination,
    };
  }

  static async searchSweets(query: ISweetSearchQuery, userRole: string) {
    const items = await sweetRepository.search(query, userRole);
    return items.map((i) => sweetSelectResponseSchema.parse(i));
  }

  static async updateSweet(id: number, data: ISweetUpdate, _userRole: string) {
    const updated = await sweetRepository.update(id, data);
    if (!updated) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        sweetErrorCode.SWEET_NOT_FOUND,
        sweetApiMessage.NOT_FOUND
      );
    }
    return sweetSelectResponseSchema.parse(updated);
  }

  static async deleteSweet(id: number, _userRole: string) {
    const deleted = await sweetRepository.softDelete(id);
    if (!deleted) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        sweetErrorCode.SWEET_NOT_FOUND,
        sweetApiMessage.NOT_FOUND
      );
    }
    return sweetSelectResponseSchema.parse(deleted);
  }

  /**
   * Reactivate a soft-deleted sweet
   * @param id - Sweet ID
   * @param _userRole - User role (admin only)
   */
  static async reactivateSweet(id: number, _userRole: string) {
    const reactivated = await sweetRepository.reactivate(id);
    if (!reactivated) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        sweetErrorCode.SWEET_NOT_FOUND,
        sweetApiMessage.NOT_FOUND
      );
    }
    return sweetSelectResponseSchema.parse(reactivated);
  }
}
