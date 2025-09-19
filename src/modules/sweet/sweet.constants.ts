export const sweetZodMessage = {
  NAME_REQUIRED: 'Sweet name is required',
  NAME_MIN: 'Sweet name must be at least 2 characters',
  NAME_MAX: 'Sweet name must be 255 characters or fewer',
  NAME_PATTERN: 'Sweet name contains invalid characters',
  PRICE_REQUIRED: 'Price is required',
  PRICE_POSITIVE: 'Price must be a positive number',
  PRICE_MAX: 'Price must be less than 999999.99',
  QUANTITY_REQUIRED: 'Quantity is required',
  QUANTITY_NON_NEGATIVE: 'Quantity must be 0 or greater',
  QUANTITY_MAX: 'Quantity must be less than 1000000',
  CATEGORY_NAME_REQUIRED: 'Category name is required',
  CATEGORY_NAME_MIN: 'Category name must be at least 1 character',
  CATEGORY_NAME_MAX: 'Category name must be 255 characters or fewer',
  UPDATE_AT_LEAST_ONE: 'At least one field must be provided',
} as const;

export const sweetZodLimits = {
  PRICE_MAX: 999999.99,
  QUANTITY_MAX: 999999,
  PURCHASE_QUANTITY_MAX: 1000,
  RESTOCK_QUANTITY_MAX: 10000,
} as const;

export const sweetApiMessage = {
  CREATED: 'Sweet created successfully',
  UPDATED: 'Sweet updated successfully',
  FETCHED: 'Sweets fetched successfully',
  NOT_FOUND: 'Sweet not found',
  NAME_EXISTS: 'Sweet name already exists',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
  PURCHASE_SUCCESS: 'Sweet purchased successfully',
  RESTOCK_SUCCESS: 'Sweet restocked successfully',
  SWEET_NAME_CONFLICT: 'Sweet name is already present !',
  SWEET_NAME_UPDATE_CONFLICT:
    'Sweet name which you are updating is already present !',
} as const;

export const sweetErrorCode = {
  SWEET_NAME_CONFLICT: 'SWEET_NAME_ALREADY_EXISTS',
  SWEET_NAME_UPDATE_CONFLICT: 'SWEET_NAME_UPDATE_ALREADY_EXISTS',
  SWEET_NOT_FOUND: 'SWEET_NOT_FOUND',
};
