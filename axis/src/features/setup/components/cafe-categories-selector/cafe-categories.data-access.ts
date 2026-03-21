import { db } from "@/db";
import { cafesCategories } from "@/db/schema/cafes-schema";
import { eq } from "drizzle-orm";

export async function getAllCafeCategories() {
	try {
		return await db.query.cafeCategories.findMany({
			columns: {
				id: true, // TODO: remove it if not needed in components
				code: true,
				title_ar: true,
				description_ar: true,
				title_en: true,
				description_en: true,
			},
		});
	} catch (error) {
		console.error("Error fetching cafe categories:", error);
		throw error;
	}
}

export async function getCafeCategories(cafeId: string): Promise<string[]> {
	try {
		const result = await db
			.select({ category_id: cafesCategories.category_id })
			.from(cafesCategories)
			.where(eq(cafesCategories.cafe_id, cafeId));

		return result.map((r) => r.category_id);
	} catch (error) {
		console.error("Error fetching cafe's categories:", error);
		throw error;
	}
}
