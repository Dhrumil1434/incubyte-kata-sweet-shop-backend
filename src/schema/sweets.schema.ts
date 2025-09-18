import { mysqlTable, int, varchar, decimal } from 'drizzle-orm/mysql-core';
import { timestamps } from './helpers/column.helpers';

export const sweets = mysqlTable('sweets', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: int('quantity').notNull().default(0),
  ...timestamps,
});
