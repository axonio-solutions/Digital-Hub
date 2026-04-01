import { relations } from 'drizzle-orm'
import { accounts, sessions, users } from './auth'
import { quotes, sparePartRequests } from './marketplace'
import { partCategories, vehicleBrands } from './taxonomy'
import { sellerBrands, sellerCategories } from './vendors'

export const usersRelations = relations(users, ({ one, many }) => ({
  requests: many(sparePartRequests),
  quotes: many(quotes),
  sessions: many(sessions),
  accounts: many(accounts),
  sellerBrands: many(sellerBrands),
  sellerCategories: many(sellerCategories),
  notificationPreference: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  notifications: many(notifications),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sparePartRequestsRelations = relations(
  sparePartRequests,
  ({ one, many }) => ({
    buyer: one(users, {
      fields: [sparePartRequests.buyerId],
      references: [users.id],
    }),
    quotes: many(quotes),
    category: one(partCategories, {
      fields: [sparePartRequests.categoryId],
      references: [partCategories.id],
    }),
    brand: one(vehicleBrands, {
      fields: [sparePartRequests.brandId],
      references: [vehicleBrands.id],
    }),
  }),
)

export const partCategoriesRelations = relations(partCategories, ({ many }) => ({
  requests: many(sparePartRequests),
  sellerCategories: many(sellerCategories),
}))

export const vehicleBrandsRelations = relations(vehicleBrands, ({ many }) => ({
  requests: many(sparePartRequests),
  sellerBrands: many(sellerBrands),
}))

export const quotesRelations = relations(quotes, ({ one }) => ({
  request: one(sparePartRequests, {
    fields: [quotes.requestId],
    references: [sparePartRequests.id],
  }),
  seller: one(users, {
    fields: [quotes.sellerId],
    references: [users.id],
  }),
}))
export const sellerBrandsRelations = relations(sellerBrands, ({ one }) => ({
  seller: one(users, {
    fields: [sellerBrands.sellerId],
    references: [users.id],
  }),
  brand: one(vehicleBrands, {
    fields: [sellerBrands.brandId],
    references: [vehicleBrands.id],
  }),
}))

export const sellerCategoriesRelations = relations(sellerCategories, ({ one }) => ({
  seller: one(users, {
    fields: [sellerCategories.sellerId],
    references: [users.id],
  }),
  category: one(partCategories, {
    fields: [sellerCategories.categoryId],
    references: [partCategories.id],
  }),
}))

import { notifications, notificationPreferences } from './notifications'

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

