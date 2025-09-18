import { z } from 'zod';
import { sweetZodMessage } from './sweet.constants';

// Field schemas
export const sweetId = z.number().int().positive();
export const sweetName = z
  .string()
  .min(2, sweetZodMessage.NAME_MIN)
  .max(255, sweetZodMessage.NAME_MAX)
  .regex(/^[A-Za-z][A-Za-z0-9\s.&-]*$/, sweetZodMessage.NAME_PATTERN);

export const sweetPrice = z
  .number()
  .positive(sweetZodMessage.PRICE_POSITIVE)
  .max(999999.99, sweetZodMessage.PRICE_MAX)
  .transform((val) => Number(val.toFixed(2))); // Ensure 2 decimal places

export const sweetQuantity = z
  .number()
  .int()
  .min(0, sweetZodMessage.QUANTITY_NON_NEGATIVE)
  .max(999999, sweetZodMessage.QUANTITY_MAX);

export const categoryId = z
  .number()
  .int()
  .positive(sweetZodMessage.CATEGORY_ID_POSITIVE);
