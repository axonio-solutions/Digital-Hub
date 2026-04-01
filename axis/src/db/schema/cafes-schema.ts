import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	jsonb,
	numeric,
	boolean as pgBoolean,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { users } from "./auth-schema";
import type { CafeAmenities } from "@/features/setup/components/information/informations.validation";

const userId = sql`public.user_id()`;

export const cafes = pgTable(
	"cafes",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		owner_id: text("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" })
			.unique(), // Each user can have only one cafe
		name_ar: text("name_ar"),
		name_en: text("name_en"),
		slug: text("slug"),
		business_email: text("business_email"),
		business_phone: text("business_phone"),
		description: text("description"),
		banner_image_url: text("banner_image_url"),
		max_capacity: integer("max_capacity"),
		amenities: jsonb("amenities")
			.$type<CafeAmenities>()
			.default(sql`'{
                "version": "1.0",
                "amenities": {
                    "basic": {
                        "wifi": false,
                        "power_outlets": false,
                        "outdoor_seating": false,
                        "air_conditioning": false,
                        "parking": false
                    },
                    "services": {
                        "takeaway": false,
                        "reservations": false,
                        "delivery": false
                    },
                    "features": {
                        "group_friendly": false,
                        "pet_friendly": false,
                        "student_discount": false,
                        "loyalty_program": false,
                        "board_games": false,
                        "live_music": false
                    },
                    "custom": {}
                },
                "details": {
                    "wifi": {
                        "has_password": false,
                        "speed": null
                    },
                    "reservations": {
                        "min_group_size": null,
                        "max_group_size": null
                    }
                }
            }'::jsonb`),
		status: text("status").notNull().default("pending"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
		address: text("address"),
		advance_booking_window: integer("advance_booking_window"),
		booking_duration: integer("booking_duration"),
		cancellation_policy: text("cancellation_policy"),
		administrative_region: text("administrative_region"),
		governorate: text("governorate"),
		street: text("street"),
		type_id: uuid("type_id"),
	},
	(table) => {
		return [
			check(
				"max_capacity_positive",
				sql`${table.max_capacity} > 0 OR ${table.max_capacity} IS NULL`,
			),
			check(
				"booking_duration_valid",
				sql`${table.booking_duration} >= 30 OR ${table.booking_duration} IS NULL`,
			),
			check(
				"advance_booking_window_positive",
				sql`${table.advance_booking_window} > 0 OR ${table.advance_booking_window} IS NULL`,
			),

			index("idx_cafes_owner_id").on(table.owner_id),
			index("idx_cafes_status").on(table.status),
			index("idx_cafes_location").on(
				table.administrative_region,
				table.governorate,
			),
			uniqueIndex("idx_cafes_slug_unique").on(table.slug),
			index("idx_cafes_type").on(table.type_id),

			// RLS Policies
			pgPolicy("Public users can view operating cafes", {
				for: "select",
				to: "public",
				using: sql`${table.status} = 'operating'`,
			}),

			pgPolicy("Users can only create their own cafes", {
				for: "insert",
				to: authenticatedRole,
				withCheck: sql`${table.owner_id} = ${userId}`,
			}),

			pgPolicy("Users can only update their own cafes", {
				for: "update",
				to: authenticatedRole,
				using: sql`${table.owner_id} = ${userId}`,
				withCheck: sql`${table.owner_id} = ${userId}`,
			}),

			pgPolicy("Users can only delete their own cafes", {
				for: "delete",
				to: authenticatedRole,
				using: sql`${table.owner_id} = ${userId}`,
			}),
		];
	},
);

export const cafeOperatingHours = pgTable(
	"cafe_operating_hours",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		day_of_week: integer("day_of_week").notNull(),
		opening_time: timestamp("opening_time", { precision: 0 }).notNull(),
		closing_time: timestamp("closing_time", { precision: 0 }).notNull(),
		is_closed: pgBoolean("is_closed").default(false),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check(
				"day_of_week_valid",
				sql`${table.day_of_week} >= 0 AND ${table.day_of_week} <= 6`,
			),
			check(
				"valid_time_range",
				sql`${table.closing_time} > ${table.opening_time}`,
			),

			index("idx_operating_hours_cafe_id").on(table.cafe_id),
			index("idx_operating_hours_day").on(table.day_of_week),

			pgPolicy("Public users can view operating cafe hours", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their operating hours", {
				for: "all",
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

export const cafeSpecialHours = pgTable(
	"cafe_special_hours",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		date: timestamp("date", { precision: 0 }).notNull(),
		opening_time: timestamp("opening_time", { precision: 0 }).notNull(),
		closing_time: timestamp("closing_time", { precision: 0 }).notNull(),
		title: text("title").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check(
				"valid_special_time_range",
				sql`${table.closing_time} > ${table.opening_time}`,
			),

			index("idx_special_hours_cafe_id").on(table.cafe_id),
			index("idx_special_hours_date").on(table.date),

			pgPolicy("Public users can view operating cafe special hours", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their special hours", {
				for: "all",
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

export const cafeTemporaryClosures = pgTable(
	"cafe_temporary_closures",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		start_day: timestamp("start_day", { precision: 0 }).notNull(),
		end_day: timestamp("end_day", { precision: 0 }).notNull(),
		reason: text("reason").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check("valid_closure_range", sql`${table.end_day} >= ${table.start_day}`),

			index("idx_closures_cafe_id").on(table.cafe_id),
			index("idx_closures_date_range").on(table.start_day, table.end_day),

			// RLS Policies
			pgPolicy("Public users can view operating cafe closures", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their closures", {
				for: "all",
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

export const cafeImages = pgTable(
	"cafe_images",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		image_url: text("image_url").notNull(),
		type: text("type").notNull(),
		sort_order: integer("sort_order").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check("valid_image_type", sql`${table.type} IN ('main', 'gallery')`),

			index("idx_cafe_images_cafe_id").on(table.cafe_id),
			index("idx_cafe_images_type").on(table.type),

			// RLS Policies
			pgPolicy("Public users can view operating cafe images", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their images", {
				for: "all",
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

export const cafeMenuImages = pgTable(
	"cafe_menu_images",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		image_url: text("image_url").notNull(),
		sort_order: integer("sort_order").default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			index("idx_cafe_menu_images_cafe_id").on(table.cafe_id),

			// RLS Policies
			pgPolicy("Public users can view operating cafe menu images", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their menu images", {
				for: "all",
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

export const cafeSocialLinks = pgTable(
	"cafe_social_links",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		platform: text("platform").notNull(),
		handle: text("handle").notNull(),
		url: text("url").notNull(),
		display_order: integer("display_order").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check(
				"valid_platform",
				sql`${table.platform} IN ('instagram', 'facebook', 'x', 'tiktok', 'snapchat', 'youtube', 'website')`,
			),

			index("idx_cafe_social_links_cafe_id").on(table.cafe_id),
			index("idx_cafe_social_links_platform").on(table.platform),

			// RLS Policies
			pgPolicy("Public users can view operating cafe social links", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their social links", {
				for: "all",
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

export const cafeTypes = pgTable(
	"cafe_types",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		code: text("code").notNull().unique(),
		title_ar: text("title_ar").notNull(),
		title_en: text("title_en").notNull(),
		description_ar: text("description_ar"),
		description_en: text("description_en"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			index("idx_cafe_types_code").on(table.code),

			pgPolicy("Public users can view cafe types", {
				for: "select",
				to: "public",
				using: sql`true`,
			}),
		];
	},
);

export const cafeCategories = pgTable(
	"cafe_categories",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		code: text("code").notNull().unique(),
		title_ar: text("title_ar").notNull(),
		title_en: text("title_en").notNull(),
		description_ar: text("description_ar"),
		description_en: text("description_en"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			index("idx_cafe_categories_code").on(table.code),

			pgPolicy("Public users can view cafe categories", {
				for: "select",
				to: "public",
				using: sql`true`,
			}),
		];
	},
);

export const cafesCategories = pgTable(
	"cafes_categories",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		category_id: uuid("category_id")
			.notNull()
			.references(() => cafeCategories.id, { onDelete: "cascade" }),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			index("idx_cafes_categories_cafe_id").on(table.cafe_id),
			index("idx_cafes_categories_category_id").on(table.category_id),

			// RLS Policies
			pgPolicy("Public users can view operating cafe categories", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their categories", {
				for: "all",
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

export const areas = pgTable(
	"areas",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		cafe_id: uuid("cafe_id")
			.notNull()
			.references(() => cafes.id, { onDelete: "cascade" }),
		name_ar: text("name_ar").notNull(),
		name_en: text("name_en").notNull().default(""),
		base_price: numeric("base_price").notNull().default("0"),
		capacity: integer("capacity").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => {
		return [
			check("base_price_non_negative", sql`${table.base_price} >= 0`),
			check("capacity_non_negative", sql`${table.capacity} >= 0`),

			index("idx_areas_cafe_id").on(table.cafe_id),

			// RLS Policies
			pgPolicy("Public users can view operating cafe areas", {
				for: "select",
				to: "public",
				using: sql`EXISTS (
          SELECT 1 FROM ${cafes}
          WHERE ${cafes.id} = ${table.cafe_id}
          AND ${cafes.status} = 'operating'
        )`,
			}),

			pgPolicy("Cafe owners can manage their areas", {
				for: "all",
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

export const cafesRelations = relations(cafes, ({ one, many }) => ({
	owner: one(users, {
		fields: [cafes.owner_id],
		references: [users.id],
	}),
	operatingHours: many(cafeOperatingHours),
	specialHours: many(cafeSpecialHours),
	temporaryClosures: many(cafeTemporaryClosures),
	images: many(cafeImages),
	menuImages: many(cafeMenuImages),
	socialLinks: many(cafeSocialLinks),
	categories: many(cafesCategories),
	areas: many(areas),
	type: one(cafeTypes, {
		fields: [cafes.type_id],
		references: [cafeTypes.id],
	}),
}));

export const cafeOperatingHoursRelations = relations(
	cafeOperatingHours,
	({ one }) => ({
		cafe: one(cafes, {
			fields: [cafeOperatingHours.cafe_id],
			references: [cafes.id],
		}),
	}),
);

export const cafeSpecialHoursRelations = relations(
	cafeSpecialHours,
	({ one }) => ({
		cafe: one(cafes, {
			fields: [cafeSpecialHours.cafe_id],
			references: [cafes.id],
		}),
	}),
);

export const cafeTemporaryClosuresRelations = relations(
	cafeTemporaryClosures,
	({ one }) => ({
		cafe: one(cafes, {
			fields: [cafeTemporaryClosures.cafe_id],
			references: [cafes.id],
		}),
	}),
);

export const cafeImagesRelations = relations(cafeImages, ({ one }) => ({
	cafe: one(cafes, {
		fields: [cafeImages.cafe_id],
		references: [cafes.id],
	}),
}));

export const cafeMenuImagesRelations = relations(cafeMenuImages, ({ one }) => ({
	cafe: one(cafes, {
		fields: [cafeMenuImages.cafe_id],
		references: [cafes.id],
	}),
}));

export const cafeSocialLinksRelations = relations(
	cafeSocialLinks,
	({ one }) => ({
		cafe: one(cafes, {
			fields: [cafeSocialLinks.cafe_id],
			references: [cafes.id],
		}),
	}),
);

export const cafesCategoriesRelations = relations(
	cafesCategories,
	({ one }) => ({
		cafe: one(cafes, {
			fields: [cafesCategories.cafe_id],
			references: [cafes.id],
		}),
		category: one(cafeCategories, {
			fields: [cafesCategories.category_id],
			references: [cafeCategories.id],
		}),
	}),
);

export const areasRelations = relations(areas, ({ one }) => ({
	cafe: one(cafes, {
		fields: [areas.cafe_id],
		references: [cafes.id],
	}),
}));
