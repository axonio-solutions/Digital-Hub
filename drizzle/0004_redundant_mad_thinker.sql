ALTER TABLE "spare_part_requests" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "spare_part_requests" ADD COLUMN "brand_id" uuid;--> statement-breakpoint
ALTER TABLE "vehicle_brands" ADD COLUMN "cluster_origin" text DEFAULT 'Unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_brands" ADD COLUMN "cluster_region" text DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE "spare_part_requests" ADD CONSTRAINT "spare_part_requests_category_id_part_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."part_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_requests" ADD CONSTRAINT "spare_part_requests_brand_id_vehicle_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."vehicle_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_brands" DROP COLUMN "origin";--> statement-breakpoint
ALTER TABLE "vehicle_brands" DROP COLUMN "specialty";