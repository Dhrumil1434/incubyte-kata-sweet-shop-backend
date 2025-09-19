export const purchaseApiMessage = {
  CREATED: 'Purchase recorded successfully',
  FETCHED: 'Purchase fetched successfully',
  LIST_FETCHED: 'Purchases fetched successfully',
  NOT_FOUND: 'Purchase not found',
  INSUFFICIENT_QUANTITY: 'Insufficient quantity available for purchase',
  UNAUTHORIZED: 'You are not authorized to view this purchase',
} as const;

export const purchaseErrorCode = {
  PURCHASE_NOT_FOUND: 'PURCHASE_NOT_FOUND',
  INSUFFICIENT_QUANTITY: 'INSUFFICIENT_QUANTITY',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SWEET_NOT_FOUND: 'SWEET_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
} as const;
