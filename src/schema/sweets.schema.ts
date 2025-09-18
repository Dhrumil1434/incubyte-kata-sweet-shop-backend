import { mysqlTable, int, varchar, decimal } from 'drizzle-orm/mysql-core';
import { timestamps } from './helpers/column.helpers';
import { categories } from './categories.schema';

export const sweets = mysqlTable('sweets', {
  id: int('id').autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  categoryId: int('category_id')
    .notNull()
    .references(() => categories.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: int('quantity').notNull().default(0),
  ...timestamps,
});
