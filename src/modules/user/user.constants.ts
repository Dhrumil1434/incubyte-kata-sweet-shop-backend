export const userZodMessage = {
  NAME_REQUIRED: 'Name is required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please provide a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_WEAK: 'Password must be at least 8 characters',
  PASSWORD_COMPLEXITY:
    'Password must contain uppercase, lowercase, number, and special character',
  ROLE_INVALID: 'Invalid role provided',
  UPDATE_AT_LEAST_ONE: 'At least one field must be provided',
  SEARCH_TOO_LONG: 'Search term must be 255 characters or fewer',
} as const;

export const userApiMessage = {
  CREATED: 'User created successfully',
  REGISTERED: 'User registered successfully !',
  LOGGED_IN: 'Logged in successfully',
  FETCHED: 'Users fetched successfully',
  UPDATED: 'User updated successfully',
  DELETED: 'User deleted successfully',
  EMAIL_EXISTS: 'Email already in use',
  NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
} as const;
