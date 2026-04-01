CREATE TABLE "seller_brands" (
	"seller_id" text NOT NULL,
	"brand_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seller_brands_seller_id_brand_id_pk" PRIMARY KEY("seller_id","brand_id")
);
--> statement-breakpoint
CREATE TABLE "seller_categories" (
	"seller_id" text NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seller_categories_seller_id_category_id_pk" PRIMARY KEY("seller_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "spare_part_requests" DROP CONSTRAINT "spare_part_requests_category_id_part_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "spare_part_requests" DROP CONSTRAINT "spare_part_requests_brand_id_vehicle_brands_id_fk";
--> statement-breakpoint
ALTER TABLE "seller_brands" ADD CONSTRAINT "seller_brands_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_brands" ADD CONSTRAINT "seller_brands_brand_id_vehicle_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."vehicle_brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_categories" ADD CONSTRAINT "seller_categories_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_categories" ADD CONSTRAINT "seller_categories_category_id_part_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."part_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_requests" ADD CONSTRAINT "spare_part_requests_category_id_part_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."part_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_requests" ADD CONSTRAINT "spare_part_requests_brand_id_vehicle_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."vehicle_brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_categories" ADD CONSTRAINT "part_categories_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "vehicle_brands" ADD CONSTRAINT "vehicle_brands_brand_unique" UNIQUE("brand");