import { db, eq } from "@/db";
import { cafes } from "@/db/schema";
import type { BookingSettingsFormValues } from "./validation";

export const updateSeatingSettings = async (
	cafeId: string,
	entry: BookingSettingsFormValues,
) => {
	try {
		return await db
			.update(cafes)
			.set({
				advance_booking_window: entry.advance_booking_window,
				booking_duration: entry.booking_duration,
				cancellation_policy: entry.cancellation_policy,
			})
			.where(eq(cafes.id, cafeId));
	} catch (error) {
		console.error("Error updating seating settings");
		throw error;
	}
};

export async function updateMaxCapacity(cafeId: string, maxCapacity: number) {
	try {
		return await db
			.update(cafes)
			.set({ max_capacity: maxCapacity })
			.where(eq(cafes.id, cafeId));
	} catch (error) {
		console.error("Error updating max capacity:", error);
		throw error;
	}
}
