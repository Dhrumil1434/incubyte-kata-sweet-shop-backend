import {
  mysqlTable,
  int,
  varchar,
  mysqlEnum,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { timestamps } from './helpers/column.helpers';

export const users = mysqlTable(
  'users',
  {
    id: int('id').autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['customer', 'admin'])
      .notNull()
      .default('customer'),
    ...timestamps,
  },
  (table) => {
    return {
      emailUnique: uniqueIndex('users_email_unique').on(table.email),
    };
  }
);
