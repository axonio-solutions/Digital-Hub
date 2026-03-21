import { pgTable, text, timestamp, uuid, pgEnum, integer } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const requestStatusEnum = pgEnum("request_status", ["open", "fulfilled", "cancelled"]);
export const quoteStatusEnum = pgEnum("quote_status", ["pending", "accepted", "rejected"]);
export const partConditionEnum = pgEnum("part_condition", ["new", "used"]);

export const sparePartRequests = pgTable("spare_part_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: text("buyer_id").notNull().references(() => users.id),
  partName: text("part_name").notNull(),
  oemNumber: text("oem_number"),
  vehicleBrand: text("vehicle_brand").notNull(),
  modelYear: text("model_year").notNull(),
  imageUrls: text("image_urls").array(), // For Photo upload integration
  status: requestStatusEnum("status").default("open").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").notNull().references(() => sparePartRequests.id),
  sellerId: text("seller_id").notNull().references(() => users.id),
  price: integer("price").notNull(), // stored in DZD
  condition: partConditionEnum("condition").notNull(),
  warranty: text("warranty"),
  status: quoteStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
