import type { AreaInput, UpdateArea } from "./seating-areas.types";
import { db, eq } from "@/db";
import { areas } from "@/db/schema";

export const getSeatingAreas = async (cafeId: string) => {
	try {
		return await db.query.areas.findMany({
			columns: {
				id: true,
				name_ar: true,
				name_en: true,
				base_price: true,
				capacity: true,
			},
			where: eq(areas.cafe_id, cafeId),
		});
	} catch (error) {
		console.error("Failed fetching Seating Areas");
		throw error;
	}
};

export const createSeatingArea = async (cafeId: string, entry: AreaInput) => {
	try {
		return await db
			.insert(areas)
			.values({
				...entry,
				base_price: entry.base_price.toString(),
				cafe_id: cafeId,
			})
			.returning();
	} catch (error) {
		console.error("Failed create seating area");
		throw error;
	}
};

export const deleteSeatingArea = async (areaId: string) => {
	try {
		return await db.delete(areas).where(eq(areas.id, areaId));
	} catch (error) {
		console.error("Failed deleting seating area");
	}
};

export const updateSeatingArea = async (entry: UpdateArea) => {
	try {
		return await db
			.update(areas)
			.set({
				name_ar: entry.name_ar,
				name_en: entry.name_en,
				capacity: entry.capacity,
				base_price: entry.base_price.toString(),
			})
			.where(eq(areas.id, entry.id))
			.returning();
	} catch (error) {
		console.error("Failed to update seating area");
		throw error;
	}
};
