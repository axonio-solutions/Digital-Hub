CREATE TYPE "public"."alert_frequency" AS ENUM('IMMEDIATE', 'DAILY_DIGEST');--> statement-breakpoint
CREATE TYPE "public"."brand_scope" AS ENUM('SPECIALTY_ONLY', 'ALL_BRANDS');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('FIRST_QUOTE', 'MILESTONE_3_QUOTES', 'ABANDONED_REQUEST', 'QUOTE_STATUS_CHANGE', 'NEW_LEAD', 'DAILY_DIGEST', 'ACCOUNT_APPROVED', 'QUOTE_WON', 'BOTTLENECK_ALERT', 'NEW_SELLER_WAITLIST', 'SPAM_FLAG', 'SYSTEM');--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"seller_alert_frequency" "alert_frequency" DEFAULT 'IMMEDIATE' NOT NULL,
	"seller_brand_scope" "brand_scope" DEFAULT 'SPECIALTY_ONLY' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "reference_id" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "is_priority" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;