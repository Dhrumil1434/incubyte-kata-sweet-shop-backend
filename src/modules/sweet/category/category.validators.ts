import { ApiError } from '../../../utils';
import { categoryRepository } from './category.repository';
import { categoryApiMessage } from './category.constants';
import { ACTIONS, ERROR_CODES, STATUS } from '../../../common/errors.constants';
import { ROLES } from '../../../common/constants';

export class CategoryValidators {
  static async ensureUniqueName(
    name: string,
    excludeId?: number
  ): Promise<void> {
    const isTaken = await categoryRepository.isNameTaken(name, excludeId);
    if (isTaken) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.CONFLICT,
        ERROR_CODES.EMAIL_ALREADY_IN_USE,
        categoryApiMessage.NAME_EXISTS
      );
    }
  }

  static async ensureCategoryExists(
    id: number,
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    const exists = await categoryRepository.existsAndAccessible(id, userRole);
    if (!exists) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        categoryApiMessage.NOT_FOUND
      );
    }
  }

  static async ensureCategoryExistsAndReturn(
    id: number,
    userRole: string = ROLES.CUSTOMER
  ) {
    const category = await categoryRepository.findById(id, userRole);
    if (!category) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        categoryApiMessage.NOT_FOUND
      );
    }

    return category;
  }

  static async validateCategoryUpdate(
    id: number,
    updateData: { name?: string | undefined; isActive?: boolean | undefined },
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    await this.ensureCategoryExists(id, userRole);

    if (updateData.name !== undefined) {
      await this.ensureUniqueName(updateData.name, id);
    }
  }

  static ensureAdminRole(userRole: string): void {
    if (userRole !== ROLES.ADMIN) {
      throw new ApiError(
        ACTIONS.FORBIDDEN,
        STATUS.FORBIDDEN,
        ERROR_CODES.INVALID_USER_ROLE,
        'Only administrators can perform this action'
      );
    }
  }

  static async ensureCategoryNotDeleted(
    id: number,
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    const category = await categoryRepository.findById(id, userRole);
    if (!category) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        categoryApiMessage.NOT_FOUND
      );
    }

    if (category.deletedAt !== null) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_REQUEST_BODY,
        'Cannot perform action on deleted category'
      );
    }
  }

  static async ensureCategoryActive(
    id: number,
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    const category = await categoryRepository.findById(id, userRole);
    if (!category) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        categoryApiMessage.NOT_FOUND
      );
    }

    if (!category.isActive) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_REQUEST_BODY,
        'Category is inactive and cannot be used'
      );
    }
  }

  static async validateCategoryCreation(
    createData: { name: string },
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    this.ensureAdminRole(userRole);
    await this.ensureUniqueName(createData.name);
  }

  static async validateCategoryDeletion(
    id: number,
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    this.ensureAdminRole(userRole);
    await this.ensureCategoryExists(id, userRole);
  }

  static async validateBulkCategoryAccess(
    ids: number[],
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    const existenceChecks = await Promise.all(
      ids.map((id) => categoryRepository.existsAndAccessible(id, userRole))
    );

    const nonExistentIds = ids.filter((_, index) => !existenceChecks[index]);
    if (nonExistentIds.length > 0) {
      throw new ApiError(
        ACTIONS.NOT_FOUND,
        STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        `Categories with IDs [${nonExistentIds.join(', ')}] not found or not accessible`
      );
    }
  }

  static async validateCategoryStatusChange(
    id: number,
    newStatus: boolean,
    userRole: string = ROLES.CUSTOMER
  ): Promise<void> {
    this.ensureAdminRole(userRole);
    const category = await this.ensureCategoryExistsAndReturn(id, userRole);

    if (!newStatus && !category.isActive) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_REQUEST_BODY,
        'Category is already inactive'
      );
    }

    if (newStatus && category.isActive) {
      throw new ApiError(
        ACTIONS.VALIDATION_ERROR,
        STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_REQUEST_BODY,
        'Category is already active'
      );
    }
  }
}
