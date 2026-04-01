import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './auth'
import { partCategories, vehicleBrands } from './taxonomy'

export const requestStatusEnum = pgEnum('request_status', [
  'draft',
  'open',
  'fulfilled',
  'cancelled',
])
export const quoteStatusEnum = pgEnum('quote_status', [
  'pending',
  'accepted',
  'rejected',
])
export const partConditionEnum = pgEnum('part_condition', ['new', 'used'])

export const sparePartRequests = pgTable(
  'spare_part_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    buyerId: text('buyer_id')
      .notNull()
      .references(() => users.id),
    categoryId: uuid('category_id').references(() => partCategories.id, {
      onDelete: 'set null',
    }),
    brandId: uuid('brand_id').references(() => vehicleBrands.id, {
      onDelete: 'set null',
    }),
    partName: text('part_name').notNull(),
    oemNumber: text('oem_number'),
    vehicleBrand: text('vehicle_brand').notNull(),
    modelYear: text('model_year').notNull(),
    imageUrls: text('image_urls').array(), // For Photo upload integration
    status: requestStatusEnum('status').default('open').notNull(),
    notes: text('notes'),
    isSpam: boolean('is_spam').default(false).notNull(),
    isPriority: boolean('is_priority').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      idx_requests_active: index('idx_requests_active').on(
        table.status,
        table.createdAt.desc()
      ),
      idx_requests_filter: index('idx_requests_filter').on(
        table.brandId,
        table.categoryId
      ),
      gin_idx_part_search: index('gin_idx_part_search').using(
        'gin',
        sql`${table.partName} gin_trgm_ops`
      ),
    }
  }
)

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: uuid('request_id')
    .notNull()
    .references(() => sparePartRequests.id),
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id),
  price: integer('price').notNull(), // stored in DZD
  condition: partConditionEnum('condition').notNull(),
  warranty: text('warranty'),
  status: quoteStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
