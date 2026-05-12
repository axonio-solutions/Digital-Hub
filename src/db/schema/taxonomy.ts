import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const taxonomyStatusEnum = pgEnum('taxonomy_status', ['active', 'draft', 'archived'])

export const partCategories = pgTable('part_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  status: taxonomyStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const vehicleBrands = pgTable('vehicle_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  brand: text('brand').notNull().unique(),
  clusterOrigin: text('cluster_origin').notNull().default('Unknown'),
  clusterRegion: text('cluster_region').notNull().default('General'),
  imageUrl: text('image_url'),
  status: taxonomyStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
