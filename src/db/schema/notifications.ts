import { boolean, pgEnum, pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const alertFrequencyEnum = pgEnum('alert_frequency', [
  'IMMEDIATE',
  'DAILY_DIGEST',
])

export const brandScopeEnum = pgEnum('brand_scope', [
  'SPECIALTY_ONLY',
  'ALL_BRANDS',
])

export const notificationTypeEnum = pgEnum('notification_type', [
  // Buyer
  'FIRST_QUOTE',
  'MILESTONE_3_QUOTES',
  'ABANDONED_REQUEST',
  'QUOTE_STATUS_CHANGE',
  'NEW_QUOTE',
  // Seller
  'NEW_LEAD',
  'DAILY_DIGEST',
  'ACCOUNT_APPROVED',
  'QUOTE_WON',
  // Admin
  'BOTTLENECK_ALERT',
  'NEW_SELLER_WAITLIST',
  'SPAM_FLAG',
  // System
  'SYSTEM',
])

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  inAppEnabled: boolean('in_app_enabled').default(true).notNull(),
  
  sellerAlertFrequency: alertFrequencyEnum('seller_alert_frequency')
    .default('IMMEDIATE')
    .notNull(),
  sellerBrandScope: brandScopeEnum('seller_brand_scope')
    .default('SPECIALTY_ONLY')
    .notNull(),
  
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  
  // Link to the specific object (request_id, quote_id, etc.)
  referenceId: text('reference_id'),
  linkUrl: text('link_url'),

  // For real-time UI updates (e.g., { requestId: '...', status: 'open', quotesCount: 5 })
  metadata: jsonb('metadata').$type<{
    requestId?: string
    status?: string
    quotesCount?: number
  }>(),

  isRead: boolean('is_read').default(false).notNull(),
  isPriority: boolean('is_priority').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
