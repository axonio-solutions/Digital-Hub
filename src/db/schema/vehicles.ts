import { text, integer, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth"; // relation to standard better-auth users

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Basic Vehicle Meta
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  
  // Optionals for identification
  vin: text("vin"),
  licensePlate: text("license_plate"),
  color: text("color"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
