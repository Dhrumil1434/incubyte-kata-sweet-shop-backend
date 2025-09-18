import { mysqlTable, int, timestamp } from 'drizzle-orm/mysql-core';
import { timestamps } from './helpers/column.helpers';
import { users } from './users.schema';
import { sweets } from './sweets.schema';

export const purchases = mysqlTable('purchases', {
  id: int('id').autoincrement(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  sweetId: int('sweet_id')
    .notNull()
    .references(() => sweets.id),
  quantity: int('quantity').notNull(),
  purchasedAt: timestamp('purchased_at', { mode: 'string' }).notNull(),
  ...timestamps,
});
