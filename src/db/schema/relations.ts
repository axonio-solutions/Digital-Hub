import { relations } from "drizzle-orm";
import { users, sessions, accounts } from "./auth";
import { sparePartRequests, quotes } from "./marketplace";

export const usersRelations = relations(users, ({ many }) => ({
  requests: many(sparePartRequests),
  quotes: many(quotes),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sparePartRequestsRelations = relations(sparePartRequests, ({ one, many }) => ({
  buyer: one(users, {
    fields: [sparePartRequests.buyerId],
    references: [users.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  request: one(sparePartRequests, {
    fields: [quotes.requestId],
    references: [sparePartRequests.id],
  }),
  seller: one(users, {
    fields: [quotes.sellerId],
    references: [users.id],
  }),
}));
