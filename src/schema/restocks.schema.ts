import { mysqlTable, int, timestamp } from 'drizzle-orm/mysql-core';
import { timestamps } from './helpers/column.helpers';
import { users } from './users.schema';
import { sweets } from './sweets.schema';

export const restocks = mysqlTable('restocks', {
  id: int('id').autoincrement(),
  sweetId: int('sweet_id')
    .notNull()
    .references(() => sweets.id),
  adminId: int('admin_id')
    .notNull()
    .references(() => users.id),
  quantity: int('quantity').notNull(),
  restockedAt: timestamp('restocked_at', { mode: 'string' }).notNull(),
  ...timestamps,
});
