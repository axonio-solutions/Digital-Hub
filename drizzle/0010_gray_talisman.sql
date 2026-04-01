DROP INDEX "gin_idx_part_search";--> statement-breakpoint
CREATE INDEX "gin_idx_part_search" ON "spare_part_requests" USING gin ("part_name" gin_trgm_ops);