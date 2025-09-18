export const sweetZodMessage = {
  NAME_REQUIRED: 'Sweet name is required',
  NAME_MIN: 'Sweet name must be at least 2 characters',
  NAME_MAX: 'Sweet name must be 255 characters or fewer',
  NAME_PATTERN: 'Sweet name contains invalid characters',
  PRICE_REQUIRED: 'Price is required',
  PRICE_POSITIVE: 'Price must be a positive number',
  PRICE_MAX: 'Price must be less than 999999.99',
  QUANTITY_REQUIRED: 'Quantity is required',
  QUANTITY_NON_NEGATIVE: 'Quantity must be a non-negative number',
  QUANTITY_MAX: 'Quantity must be less than 999999',
  CATEGORY_ID_REQUIRED: 'Category ID is required',
  CATEGORY_ID_POSITIVE: 'Category ID must be a positive number',
  UPDATE_AT_LEAST_ONE: 'At least one field must be provided',
} as const;

export const sweetApiMessage = {
  CREATED: 'Sweet created successfully',
  UPDATED: 'Sweet updated successfully',
  FETCHED: 'Sweets fetched successfully',
  NOT_FOUND: 'Sweet not found',
  NAME_EXISTS: 'Sweet name already exists',
  DELETED: 'Sweet deleted successfully',
  PURCHASED: 'Sweet purchased successfully',
  RESTOCKED: 'Sweet restocked successfully',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
} as const;
