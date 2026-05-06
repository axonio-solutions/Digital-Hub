CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_account_status" ON "users" USING btree ("account_status");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quotes_seller_id" ON "quotes" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_quotes_request_id" ON "quotes" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_requests_buyer_id" ON "spare_part_requests" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "idx_requests_created_at" ON "spare_part_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "view_mode_general_broadcast";