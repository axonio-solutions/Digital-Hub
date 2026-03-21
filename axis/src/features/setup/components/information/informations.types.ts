import type { cafes } from "@/db/schema/cafes-schema";
import type { InferResultType } from "@/types/drizzle";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type {
	cafeInformationFormSchema,
	cafeProfileSchema,
	contactFormSchema,
} from "./informations.validation";

export type CafeInsert = InferInsertModel<typeof cafes>;

export type CafeSelect = InferSelectModel<typeof cafes>;
export type CafeSelectWithCategories = InferResultType<
	"cafes",
	{
		categories: {
			columns: { category_id: true };
		};
	}
>;

export type CafeProfileFormValues = z.infer<typeof cafeProfileSchema>;
export type CafeInformationFormValues = Omit<
	CafeProfileFormValues,
	"amenities" | "business_email" | "business_phone"
>;
export type UpdateCafeInputs = z.infer<typeof cafeInformationFormSchema>;

export type UpdateCafeContactInformationInputs = z.infer<
	typeof contactFormSchema
>;
