CREATE INDEX "idx_requests_active" ON "spare_part_requests" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_requests_filter" ON "spare_part_requests" USING btree ("brand_id","category_id");--> statement-breakpoint
CREATE INDEX "gin_idx_part_search" ON "spare_part_requests" USING gin ("part_name");