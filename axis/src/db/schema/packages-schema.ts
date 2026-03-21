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
import { cafes } from "./cafes-schema";

const userId = sql`public.user_id()`;

export const packageStatusEnum = pgEnum("package_status", [
	"active",
	"inactive",
]);

export const packages = pgTable(
	"packages",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		status: packageStatusEnum("status").notNull().default("inactive"),
		version: integer("version").notNull().default(1),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			// Index on cafe_id for efficient queries by cafe
			index("idx_packages_cafe_id").on(table.cafe_id),

			// Index on status for filtering packages by status
			index("idx_packages_status").on(table.status),

			// Composite index for cafe_id + status for common query pattern
			index("idx_packages_cafe_status").on(table.cafe_id, table.status),

			// Row Level Security Policies

			// Everyone can view active packages
			pgPolicy("Public users can view active packages", {
				for: "select",
				to: "public",
				using: sql`${table.status} = 'active'`,
			}),

			// Cafe owners can view all their packages
			pgPolicy("Cafe owners can view all their packages", {
				for: "select",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			// Cafe owners can create packages for their cafes
			pgPolicy("Cafe owners can create packages for their cafes", {
				for: "insert",
				to: authenticatedRole,
				withCheck: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			// Cafe owners can update their packages
			pgPolicy("Cafe owners can update their packages", {
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

			// Cafe owners can delete their packages
			pgPolicy("Cafe owners can delete their packages", {
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

export const packageItems = pgTable(
	"package_items",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		package_id: uuid("package_id")
			.notNull()
			.references(() => packages.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		price: numeric("price").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check("price_non_negative", sql`${table.price} >= 0`),

			index("idx_package_items_package_id").on(table.package_id),

			// Row Level Security Policies

			pgPolicy("Public users can view items from active packages", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${packages}
          WHERE ${packages.id} = ${table.package_id}
          AND ${packages.status} = 'active'
        )`,
			}),

			pgPolicy("Cafe owners can view all package items", {
				for: "select",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${packages}
          JOIN ${cafes} ON ${cafes.id} = ${packages.cafe_id}
          WHERE ${packages.id} = ${table.package_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Cafe owners can create items for their packages", {
				for: "insert",
				to: authenticatedRole,
				withCheck: sql`EXISTS (
          SELECT 1 FROM ${packages}
          JOIN ${cafes} ON ${cafes.id} = ${packages.cafe_id}
          WHERE ${packages.id} = ${table.package_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Cafe owners can update items in their packages", {
				for: "update",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${packages}
          JOIN ${cafes} ON ${cafes.id} = ${packages.cafe_id}
          WHERE ${packages.id} = ${table.package_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
				withCheck: sql`EXISTS (
          SELECT 1 FROM ${packages}
          JOIN ${cafes} ON ${cafes.id} = ${packages.cafe_id}
          WHERE ${packages.id} = ${table.package_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),

			pgPolicy("Cafe owners can delete items from their packages", {
				for: "delete",
				to: authenticatedRole,
				using: sql`EXISTS (
          SELECT 1 FROM ${packages}
          JOIN ${cafes} ON ${cafes.id} = ${packages.cafe_id}
          WHERE ${packages.id} = ${table.package_id}
          AND ${cafes.owner_id} = ${userId}
        )`,
			}),
		];
	},
);

export const packagesRelations = relations(packages, ({ one, many }) => ({
	cafe: one(cafes, {
		fields: [packages.cafe_id],
		references: [cafes.id],
	}),
	items: many(packageItems),
}));

export const packageItemsRelations = relations(packageItems, ({ one }) => ({
	package: one(packages, {
		fields: [packageItems.package_id],
		references: [packages.id],
	}),
}));
