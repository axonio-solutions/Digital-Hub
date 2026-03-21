// cafe-categories.types.ts
import type { cafeCategories } from "@/db/schema/cafes-schema";
import type { InferSelectModel } from "drizzle-orm";

export type CafeCategory = InferSelectModel<typeof cafeCategories>;
export type CafeCategoryRelation = {
  category_id: string;
  cafe_id: string;
};