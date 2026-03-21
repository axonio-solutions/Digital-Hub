import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	numeric,
	pgEnum,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { users } from "./auth-schema";
import { cafes } from "./cafes-schema";
import { packageStatusEnum, packages } from "./packages-schema";

const userId = sql`public.user_id()`;

export const eventStatusEnum = pgEnum("event_status", [
	"upcoming",
	"ongoing",
	"completed",
	"cancelled",
]);

export const eventTypeEnum = pgEnum("event_type", ["football_match"]);

export const bookingStatusEnum = pgEnum("booking_status", [
	"pending",
	"confirmed",
	"cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"paid",
	"refunded",
]);

export const events = pgTable(
	"events",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		type: eventTypeEnum("type").notNull(),
		start_time: timestamp("start_time", { withTimezone: true }).notNull(),
		end_time: timestamp("end_time", { withTimezone: true }),
		base_price: numeric("base_price").notNull(),
		total_capacity: integer("total_capacity").notNull(),
		remaining_capacity: integer("remaining_capacity").notNull(),
		status: eventStatusEnum("status").notNull().default("upcoming"),
		version: integer("version").notNull().default(1),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
		cancellation_reason: text("cancellation_reason"),
		cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
	},
	(table) => {
		return [
			check("base_price_non_negative", sql`${table.base_price} >= 0`),
			check("total_capacity_positive", sql`${table.total_capacity} > 0`),
			check(
				"remaining_capacity_non_negative",
				sql`${table.remaining_capacity} >= 0`,
			),

			index("idx_events_cafe_id").on(table.cafe_id),

			index("idx_events_status").on(table.status),

			index("idx_events_start_time").on(table.start_time),

			index("idx_events_cafe_status").on(table.cafe_id, table.status),

			index("idx_events_status_time").on(table.status, table.start_time),

			// Row Level Security Policies

			pgPolicy("Public users can view public events", {
				for: "select",
				to: "public",
				using: sql`${table.status} IN ('upcoming', 'ongoing', 'completed')`,
			}),

			pgPolicy("Cafe owners can view all their events", {
				for: "select",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Cafe owners can create events for their cafes", {
				for: "insert",
				to: authenticatedRole,
				withCheck: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Cafe owners can update their events", {
				for: "update",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
				withCheck: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Cafe owners can delete their events", {
				for: "delete",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),
		];
	},
);

export const eventAreas = pgTable(
	"event_areas",
	{
		event_id: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		area_id: uuid("area_id").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			index("idx_event_areas_event_id").on(table.event_id),
			index("idx_event_areas_area_id").on(table.area_id),

			pgPolicy("Public users can view event areas", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${events}
          WHERE ${events.id} = ${table.event_id}
          AND ${events.status} IN ('upcoming', 'ongoing', 'completed')
        )`,
			}),

			pgPolicy("Cafe owners can manage event areas", {
				for: "all",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${events}
          JOIN ${cafes} ON ${cafes.id} = ${events.cafe_id}
          WHERE ${events.id} = ${table.event_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),
		];
	},
);

export const eventPackages = pgTable(
	"event_packages",
	{
		event_id: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		package_id: uuid("package_id")
			.notNull()
			.references(() => packages.id, { onDelete: "cascade" }),
		override_price: numeric("override_price"),
		status: packageStatusEnum("status").notNull().default("active"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check(
				"override_price_non_negative",
				sql`${table.override_price} >= 0 OR ${table.override_price} IS NULL`,
			),

			index("idx_event_packages_event_id").on(table.event_id),
			index("idx_event_packages_package_id").on(table.package_id),

			pgPolicy("Public users can view active event packages", {
				for: "select",
				to: "public",
				using: sql`${table.status} = 'active' AND EXISTS (
          SELECT 1 FROM ${events}
          WHERE ${events.id} = ${table.event_id}
          AND ${events.status} IN ('upcoming', 'ongoing', 'completed')
        )`,
			}),

			pgPolicy("Cafe owners can manage event packages", {
				for: "all",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${events}
          JOIN ${cafes} ON ${cafes.id} = ${events.cafe_id}
          WHERE ${events.id} = ${table.event_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),
		];
	},
);

export const eventBookings = pgTable(
	"event_bookings",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		event_id: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		user_id: text("user_id").references(() => users.id),
		quantity: integer("quantity").notNull(),
		total_price: numeric("total_price").notNull(),
		status: bookingStatusEnum("status").notNull().default("pending"),
		payment_status: paymentStatusEnum("payment_status")
			.notNull()
			.default("pending"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check("quantity_positive", sql`${table.quantity} > 0`),
			check("total_price_non_negative", sql`${table.total_price} >= 0`),

			index("idx_event_bookings_event_id").on(table.event_id),
			index("idx_event_bookings_user_id").on(table.user_id),
			index("idx_event_bookings_status").on(table.status),

			// RLS policies

			pgPolicy("Users can view their own bookings", {
				for: "select",
				to: authenticatedRole,
				using: sql`${table.user_id} = ${userId}`,
			}),

			pgPolicy("Cafe owners can view bookings for their events", {
				for: "select",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${events}
          JOIN ${cafes} ON ${cafes.id} = ${events.cafe_id}
          WHERE ${events.id} = ${table.event_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Users can create bookings", {
				for: "insert",
				to: authenticatedRole,
				withCheck: sql`${table.user_id} = ${userId}`,
			}),

			pgPolicy("Users can only update their own bookings", {
				for: "update",
				to: authenticatedRole,
				using: sql`${table.user_id} = ${userId}`,
				withCheck: sql`${table.user_id} = ${userId}`,
			}),

			pgPolicy("Cafe owners can update booking status", {
				for: "update",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${events}
          JOIN ${cafes} ON ${cafes.id} = ${events.cafe_id}
          WHERE ${events.id} = ${table.event_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),
		];
	},
);

export const bookingPackages = pgTable(
	"booking_packages",
	{
		booking_id: uuid("booking_id")
			.notNull()
			.references(() => eventBookings.id, { onDelete: "cascade" }),
		package_id: uuid("package_id")
			.notNull()
			.references(() => packages.id, { onDelete: "cascade" }),
		quantity: integer("quantity").notNull(),
		price_at_booking: numeric("price_at_booking"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check("quantity_positive", sql`${table.quantity} > 0`),
			check(
				"price_at_booking_non_negative",
				sql`${table.price_at_booking} >= 0 OR ${table.price_at_booking} IS NULL`,
			),

			index("idx_booking_packages_booking_id").on(table.booking_id),
			index("idx_booking_packages_package_id").on(table.package_id),

			// RLS policies

			pgPolicy("Users can view their own booking packages", {
				for: "select",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${eventBookings}
          WHERE ${eventBookings.id} = ${table.booking_id}
          AND ${eventBookings.user_id} = ${userId}
        )`,
			}),

			pgPolicy("Cafe owners can view booking packages", {
				for: "select",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${eventBookings}
          JOIN ${events} ON ${events.id} = ${eventBookings.event_id}
          JOIN ${cafes} ON ${cafes.id} = ${events.cafe_id}
          WHERE ${eventBookings.id} = ${table.booking_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Users can add packages to their bookings", {
				for: "insert",
				to: authenticatedRole,
				withCheck: sql`EXISTS (
          SELECT 1 FROM ${eventBookings}
          WHERE ${eventBookings.id} = ${table.booking_id}
          AND ${eventBookings.user_id} = ${userId}
        )`,
			}),

			pgPolicy("Users can update their booking packages", {
				for: "update",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${eventBookings}
          WHERE ${eventBookings.id} = ${table.booking_id}
          AND ${eventBookings.user_id} = ${userId}
        )`,
			}),

			pgPolicy("Users can remove packages from their bookings", {
				for: "delete",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${eventBookings}
          WHERE ${eventBookings.id} = ${table.booking_id}
          AND ${eventBookings.user_id} = ${userId}
        )`,
			}),
		];
	},
);

export const footballMatches = pgTable(
	"football_matches",
	{
		id: uuid("id")
			.primaryKey()
			.references(() => events.id, { onDelete: "cascade" }),
		match_id: integer("match_id").notNull(),
	},
	(table) => {
		return [
			index("idx_football_matches_match_id").on(table.match_id),

			pgPolicy("Public users can view football matches", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${events}
          WHERE ${events.id} = ${table.id}
          AND ${events.status} IN ('upcoming', 'ongoing', 'completed')
        )`,
			}),

			pgPolicy("Cafe owners can manage football matches", {
				for: "all",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${events}
          JOIN ${cafes} ON ${cafes.id} = ${events.cafe_id}
          WHERE ${events.id} = ${table.id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),
		];
	},
);

export const eventsRelations = relations(events, ({ one, many }) => ({
	cafe: one(cafes, {
		fields: [events.cafe_id],
		references: [cafes.id],
	}),
	areas: many(eventAreas),
	packages: many(eventPackages),
	bookings: many(eventBookings),
	footballMatch: one(footballMatches, {
		fields: [events.id],
		references: [footballMatches.id],
	}),
}));

export const eventAreasRelations = relations(eventAreas, ({ one }) => ({
	event: one(events, {
		fields: [eventAreas.event_id],
		references: [events.id],
	}),
}));

export const eventPackagesRelations = relations(eventPackages, ({ one }) => ({
	event: one(events, {
		fields: [eventPackages.event_id],
		references: [events.id],
	}),
	package: one(packages, {
		fields: [eventPackages.package_id],
		references: [packages.id],
	}),
}));

export const eventBookingsRelations = relations(
	eventBookings,
	({ one, many }) => ({
		event: one(events, {
			fields: [eventBookings.event_id],
			references: [events.id],
		}),
		user: one(users, {
			fields: [eventBookings.user_id],
			references: [users.id],
		}),
		bookingPackages: many(bookingPackages),
	}),
);

export const bookingPackagesRelations = relations(
	bookingPackages,
	({ one }) => ({
		booking: one(eventBookings, {
			fields: [bookingPackages.booking_id],
			references: [eventBookings.id],
		}),
		package: one(packages, {
			fields: [bookingPackages.package_id],
			references: [packages.id],
		}),
	}),
);

export const footballMatchesRelations = relations(
	footballMatches,
	({ one }) => ({
		event: one(events, {
			fields: [footballMatches.id],
			references: [events.id],
		}),
	}),
);
