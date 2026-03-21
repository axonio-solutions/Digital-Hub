import { text, boolean, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth"; // relation to standard better-auth users

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Notice specific payload
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ['new_quote', 'quote_accepted', 'system'] }).notNull(),
  linkUrl: text("link_url"), // Optional URL to click into (e.g. /dashboard/requests/xxx)
  
  // State 
  isRead: boolean("is_read").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
