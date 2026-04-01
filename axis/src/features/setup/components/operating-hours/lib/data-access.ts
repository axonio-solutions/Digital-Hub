import { eq } from "drizzle-orm";
import { DAY_MAPPING } from "./types";
import type { OperatingHoursData } from "./types";
import { db } from "@/db";
import { cafeOperatingHours } from "@/db/schema/cafes-schema";

export async function getCafeOperatingHours(cafeId: string) {
	try {
		const hours = await db.query.cafeOperatingHours.findMany({
			where: eq(cafeOperatingHours.cafe_id, cafeId),
			orderBy: cafeOperatingHours.day_of_week,
		});

		return hours;
	} catch (error) {
		console.error("Error fetching cafe operating hours:", error);
		throw error;
	}
}

export async function updateCafeOperatingHours(
	cafeId: string,
	hourData: OperatingHoursData,
) {
	try {
		return await db.transaction(async (tx) => {
			// Delete existing hours
			await tx
				.delete(cafeOperatingHours)
				.where(eq(cafeOperatingHours.cafe_id, cafeId));

			// Insert new hours for each day
			const hoursToInsert = [];

			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const dayKey = DAY_MAPPING[dayIndex];
				const dayData = hourData[dayKey];

				if (dayData.enabled && dayData.timeSlots.length > 0) {
					// Insert each time slot
					for (const slot of dayData.timeSlots) {
						hoursToInsert.push({
							cafe_id: cafeId,
							day_of_week: dayIndex,
							opening_time: new Date(`1970-01-01T${slot.from}:00`),
							closing_time: new Date(`1970-01-01T${slot.to}:00`),
							is_closed: false,
						});
					}
				} else {
					// Insert a closed day
					hoursToInsert.push({
						cafe_id: cafeId,
						day_of_week: dayIndex,
						opening_time: new Date("1970-01-01T09:00:00"),
						closing_time: new Date("1970-01-01T17:00:00"),
						is_closed: true,
					});
				}
			}

			if (hoursToInsert.length > 0) {
				await tx.insert(cafeOperatingHours).values(hoursToInsert);
			}

			return true;
		});
	} catch (error) {
		console.error("Error updating cafe operating hours:", error);
		throw error;
	}
}
