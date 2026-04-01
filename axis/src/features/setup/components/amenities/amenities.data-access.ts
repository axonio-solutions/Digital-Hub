import type { CafeAmenities } from "../information/informations.validation";
import { db, eq } from "@/db";
import { cafes } from "@/db/schema";

export const updateAmenities = async (
	amenities: CafeAmenities,
	cafeId: string,
) => {
	try {
		return await db.transaction(async (tx) => {
			const [updateAmenities] = await tx
				.update(cafes)
				.set({
					amenities,
				})
				.where(eq(cafes.id, cafeId))
				.returning();
			return updateAmenities;
		});
	} catch (error) {
		console.error("Error updating amenities", error);
	}
};
