import { relations } from 'drizzle-orm'
import { accounts, sessions, users } from './auth'
import { quotes, sparePartRequests } from './marketplace'
import { partCategories, vehicleBrands } from './taxonomy'
import { sellerBrands, sellerCategories } from './vendors'
import { creditPackages, creditRequests, creditTransactions } from './credits'

import { notificationPreferences, notifications } from './notifications'

export const usersRelations = relations(users, ({ one, many }) => ({
  requests: many(sparePartRequests),
  quotes: many(quotes),
  sessions: many(sessions),
  accounts: many(accounts),
  sellerBrands: many(sellerBrands),
  sellerCategories: many(sellerCategories),
  creditTransactions: many(creditTransactions),
  creditRequests: many(creditRequests),
  grantedTransactions: many(creditTransactions, {
    relationName: 'adminTransactions',
  }),
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

export const partCategoriesRelations = relations(
  partCategories,
  ({ many }) => ({
    requests: many(sparePartRequests),
    sellerCategories: many(sellerCategories),
  }),
)

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

export const sellerCategoriesRelations = relations(
  sellerCategories,
  ({ one }) => ({
    seller: one(users, {
      fields: [sellerCategories.sellerId],
      references: [users.id],
    }),
    category: one(partCategories, {
      fields: [sellerCategories.categoryId],
      references: [partCategories.id],
    }),
  }),
)

export const creditRequestsRelations = relations(creditRequests, ({ one }) => ({
  seller: one(users, {
    fields: [creditRequests.sellerId],
    references: [users.id],
  }),
  package: one(creditPackages, {
    fields: [creditRequests.packageId],
    references: [creditPackages.id],
  }),
  admin: one(users, {
    fields: [creditRequests.adminId],
    references: [users.id],
  }),
}))

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  }),
)

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    seller: one(users, {
      fields: [creditTransactions.sellerId],
      references: [users.id],
    }),
    admin: one(users, {
      fields: [creditTransactions.adminId],
      references: [users.id],
      relationName: 'adminTransactions',
    }),
    package: one(creditPackages, {
      fields: [creditTransactions.packageId],
      references: [creditPackages.id],
    }),
  }),
)

export const creditPackagesRelations = relations(
  creditPackages,
  ({ many }) => ({
    transactions: many(creditTransactions),
  }),
)
