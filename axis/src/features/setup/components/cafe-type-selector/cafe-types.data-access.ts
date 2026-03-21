import { db } from "@/db";

export async function getCafeTypes() {
	try {
		const types = await db.query.cafeTypes.findMany({
			columns: {
				id: true, // tODO: remove it if not needed in components
				code: true,
				title_ar: true,
				description_ar: true,
			},
		});
		return types;
	} catch (error) {
		console.error("Database error fetching cafe types:", error);
		throw error;
	}
}
