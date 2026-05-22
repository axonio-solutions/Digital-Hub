ALTER TABLE "quotes" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."quote_status";--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."quote_status";--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "status" SET DATA TYPE "public"."quote_status" USING "status"::"public"."quote_status";--> statement-breakpoint
CREATE INDEX "idx_requests_buyer_status" ON "spare_part_requests" USING btree ("buyer_id","status");--> statement-breakpoint
CREATE INDEX "idx_requests_category_status" ON "spare_part_requests" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "idx_requests_brand_status" ON "spare_part_requests" USING btree ("brand_id","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_unread" ON "notifications" USING btree ("user_id","is_read","created_at");