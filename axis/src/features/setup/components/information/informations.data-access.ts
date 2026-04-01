import { eq } from "drizzle-orm";
import type { UpdateCafeInputs } from "./informations.types";
import { db } from "@/db";
import { cafes, cafesCategories } from "@/db/schema/cafes-schema";

export async function getCafeInformation(cafeId: string) {
	try {
		const cafe = await db.query.cafes.findFirst({
			where: eq(cafes.id, cafeId),
			with: {
				categories: {
					columns: { category_id: true },
				},
			},
		});
		return cafe;
	} catch (error) {
		console.error("Error fetching cafe information:", error);
		throw error;
	}
}

export async function updateCafeInformation(
	input: UpdateCafeInputs,
	cafeId: string,
) {
	return await db.transaction(async (tx) => {
		await tx
			.update(cafes)
			.set({
				name_ar: input.name_ar,
				name_en: input.name_en,
				slug: input.slug,
				description: input.description || null,
				administrative_region: input.administrative_region || null,
				governorate: input.governorate || null,
				street: input.street || null,
				type_id: input.type_id,
			})
			.where(eq(cafes.id, cafeId));

		if (input.categories?.length) {
			await tx
				.delete(cafesCategories)
				.where(eq(cafesCategories.cafe_id, cafeId));
			await tx.insert(cafesCategories).values(
				input.categories.map((categoryId) => ({
					category_id: categoryId,
					cafe_id: cafeId,
				})),
			);
		}
	});
}

export async function getSpaceSettings(cafeId: string) {
	try {
		const data = await db.query.cafes.findFirst({
			where: eq(cafes.id, cafeId),
			columns: {
				max_capacity: true,
				advance_booking_window: true,
				booking_duration: true,
				cancellation_policy: true,
			},
		});
		return data;
	} catch (error) {
		console.error("Error fetching space settings:", error);
		throw error;
	}
}
