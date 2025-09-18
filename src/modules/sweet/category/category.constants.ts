export const categoryZodMessage = {
  NAME_REQUIRED: 'Category name is required',
  NAME_MIN: 'Category name must be at least 2 characters',
  NAME_MAX: 'Category name must be 255 characters or fewer',
  NAME_PATTERN: 'Category name contains invalid characters',
  UPDATE_AT_LEAST_ONE: 'At least one field must be provided',
} as const;

export const categoryApiMessage = {
  CREATED: 'Category created successfully',
  UPDATED: 'Category updated successfully',
  FETCHED: 'Categories fetched successfully',
  NOT_FOUND: 'Category not found',
  NAME_EXISTS: 'Category name already exists',
} as const;
