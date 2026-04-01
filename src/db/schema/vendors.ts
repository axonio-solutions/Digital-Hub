import { pgTable, text, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { partCategories, vehicleBrands } from './taxonomy'

export const sellerBrands = pgTable('seller_brands', {
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  brandId: uuid('brand_id')
    .notNull()
    .references(() => vehicleBrands.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.sellerId, t.brandId] }),
}))

export const sellerCategories = pgTable('seller_categories', {
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => partCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.sellerId, t.categoryId] }),
}))
