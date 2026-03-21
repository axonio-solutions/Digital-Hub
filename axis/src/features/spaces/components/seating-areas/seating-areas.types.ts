import type { areas } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { areaSchema, updateAreaSchema } from "./seating-areas.validations";

export type Area = Omit<
	InferSelectModel<typeof areas>,
	"cafe_id" | "created_at" | "updated_at"
>;

export type UpdateArea = z.infer<typeof updateAreaSchema>;

export type AreaFormValues = z.infer<typeof areaSchema>;

export type AreaInput = z.infer<typeof areaSchema>;
