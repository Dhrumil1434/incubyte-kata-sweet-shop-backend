import { mysqlTable, int, varchar, uniqueIndex } from 'drizzle-orm/mysql-core';
import { timestamps } from './helpers/column.helpers';

export const categories = mysqlTable(
  'categories',
  {
    id: int('id').autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => ({
    nameUnique: uniqueIndex('categories_name_unique').on(table.name),
  })
);
