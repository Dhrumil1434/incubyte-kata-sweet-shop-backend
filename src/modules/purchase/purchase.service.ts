import { purchaseRepository } from './purchase.repository';
import {
  purchaseResponseSchema,
  IPurchaseCreate,
  IPurchaseListQuery,
} from './purchase.zod';
import { ApiError } from '../../utils';
import { ACTIONS, STATUS } from '../../common/errors.constants';
import { purchaseApiMessage, purchaseErrorCode } from './purchase.constants';
import { sweetRepository } from '../sweet/sweet.repository';
import { ROLES } from '../../common/constants';

export class PurchaseService {
  /**
   * Create a new purchase record and update sweet quantity
   * @param data - Purchase data
   * @param userId - User ID making the purchase
   * @param userRole - User role
   */
  static async createPurchase(
    data: IPurchaseCreate,
    userId: number,
    userRole: string
  ) {
    // First, check if the sweet exists and has enough quantity
    const sweet = await sweetRepository.findById(data.sweetId, userRole);
    if (!sweet) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        purchaseErrorCode.SWEET_NOT_FOUND,
        'Sweet not found'
      );
    }

    if (sweet.quantity < data.quantity) {
      throw new ApiError(
        ACTIONS.BAD_REQUEST,
        STATUS.BAD_REQUEST,
        purchaseErrorCode.INSUFFICIENT_QUANTITY,
        purchaseApiMessage.INSUFFICIENT_QUANTITY
      );
    }

    // Create purchase record
    const purchase = await purchaseRepository.create({
      ...data,
      userId,
    });

    // Update sweet quantity (decrease by purchased amount)
    await sweetRepository.purchase(data.sweetId, data.quantity);

    return purchaseResponseSchema.parse(purchase);
  }

  /**
   * Get purchase by ID
   * @param id - Purchase ID
   * @param userRole - User role
   * @param requestingUserId - ID of the user making the request
   */
  static async getPurchaseById(
    id: number,
    userRole: string,
    requestingUserId?: number
  ) {
    const purchase = await purchaseRepository.findById(id, userRole);
    if (!purchase) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        purchaseErrorCode.PURCHASE_NOT_FOUND,
        purchaseApiMessage.NOT_FOUND
      );
    }

    // For customers, ensure they can only access their own purchases
    if (
      userRole === ROLES.CUSTOMER &&
      requestingUserId &&
      purchase.userId !== requestingUserId
    ) {
      throw new ApiError(
        ACTIONS.FORBIDDEN,
        STATUS.FORBIDDEN,
        purchaseErrorCode.UNAUTHORIZED_ACCESS,
        purchaseApiMessage.UNAUTHORIZED
      );
    }

    return purchaseResponseSchema.parse(purchase);
  }

  /**
   * List purchases with pagination and filtering
   * @param query - Query parameters
   * @param userRole - User role
   * @param requestingUserId - ID of the user making the request
   */
  static async listPurchases(
    query: IPurchaseListQuery,
    userRole: string,
    requestingUserId?: number
  ) {
    const result = await purchaseRepository.list(
      query,
      userRole,
      requestingUserId
    );
    return {
      items: result.items.map((item) => purchaseResponseSchema.parse(item)),
      total: result.total,
      pagination: result.pagination,
    };
  }

  /**
   * Get purchases by user ID
   * @param userId - User ID
   * @param query - Query parameters
   * @param userRole - User role
   * @param requestingUserId - ID of the user making the request
   */
  static async getPurchasesByUser(
    userId: number,
    query: IPurchaseListQuery,
    userRole: string,
    requestingUserId?: number
  ) {
    // For customers, ensure they can only access their own purchases
    if (
      userRole === ROLES.CUSTOMER &&
      requestingUserId &&
      userId !== requestingUserId
    ) {
      throw new ApiError(
        ACTIONS.FORBIDDEN,
        STATUS.FORBIDDEN,
        purchaseErrorCode.UNAUTHORIZED_ACCESS,
        purchaseApiMessage.UNAUTHORIZED
      );
    }

    const result = await purchaseRepository.getPurchasesByUser(
      userId,
      query,
      userRole
    );
    return {
      items: result.items.map((item) => purchaseResponseSchema.parse(item)),
      total: result.total,
      pagination: result.pagination,
    };
  }

  /**
   * Get purchases by sweet ID
   * @param sweetId - Sweet ID
   * @param query - Query parameters
   * @param userRole - User role
   */
  static async getPurchasesBySweet(
    sweetId: number,
    query: IPurchaseListQuery,
    userRole: string
  ) {
    const result = await purchaseRepository.getPurchasesBySweet(
      sweetId,
      query,
      userRole
    );
    return {
      items: result.items.map((item) => purchaseResponseSchema.parse(item)),
      total: result.total,
      pagination: result.pagination,
    };
  }
}
