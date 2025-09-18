import { relations } from 'drizzle-orm/relations';
import { sweets, purchases, users, restocks, categories } from './schema';

export const purchasesRelations = relations(purchases, ({ one }) => ({
  sweet: one(sweets, {
    fields: [purchases.sweetId],
    references: [sweets.id],
  }),
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));

export const sweetsRelations = relations(sweets, ({ one, many }) => ({
  purchases: many(purchases),
  restocks: many(restocks),
  category: one(categories, {
    fields: [sweets.categoryId],
    references: [categories.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  restocks: many(restocks),
}));

export const restocksRelations = relations(restocks, ({ one }) => ({
  user: one(users, {
    fields: [restocks.adminId],
    references: [users.id],
  }),
  sweet: one(sweets, {
    fields: [restocks.sweetId],
    references: [sweets.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  sweets: many(sweets),
}));
