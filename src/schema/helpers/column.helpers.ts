import { sql } from 'drizzle-orm';
import { boolean, timestamp, datetime } from 'drizzle-orm/mysql-core';

// Common column helpers to be reused across tables
export const timestamps = {
  is_active: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { mode: 'string' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
  deletedAt: datetime('deleted_at', { mode: 'string' }),
};
