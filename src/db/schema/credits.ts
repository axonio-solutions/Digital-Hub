import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './auth'

export const creditRequestStatusEnum = [
  'pending',
  'approved',
  'rejected',
] as const

export const creditRequests = pgTable('credit_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  packageId: uuid('package_id').references(() => creditPackages.id, {
    onDelete: 'set null',
  }),
  credits: integer('credits').notNull(),
  status: text('status').default('pending').notNull(),
  adminId: text('admin_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const creditPackages = pgTable('credit_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  credits: integer('credits').notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  referenceId: uuid('reference_id'),
  description: text('description'),
  packageId: uuid('package_id').references(() => creditPackages.id, {
    onDelete: 'set null',
  }),
  adminId: text('admin_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const creditTransactionTypes = [
  'purchase',
  'bonus',
  'quote_spent',
  'admin_adjustment',
  'credit_request_approved',
] as const
