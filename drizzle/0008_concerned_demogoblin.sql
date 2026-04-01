ALTER TYPE "public"."notification_type" ADD VALUE 'NEW_QUOTE' BEFORE 'NEW_LEAD';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "view_mode_general_broadcast" boolean DEFAULT true NOT NULL;