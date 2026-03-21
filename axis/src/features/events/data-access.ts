import { db, eq } from "@/db";
import {
	events,
	eventAreas,
	eventPackages,
	footballMatches,
} from "@/db/schema";
import type { CreateMatchInput } from "@/features/events/types";
import { and } from "drizzle-orm";
import type { EditMatchEntry } from "./schema";

export async function getMatchEvents(cafeId: string) {
	try {
		return await db.query.events.findMany({
			where: and(eq(events.cafe_id, cafeId), eq(events.type, "football_match")),
			columns: {
				id: true,
				name: true,
				start_time: true,
				base_price: true,
				total_capacity: true,
				remaining_capacity: true,
				status: true,
			},
		});
	} catch (error) {
		console.error("Error fetching match events:", error);
		throw error;
	}
}

export async function createFootballMatch(input: CreateMatchInput) {
	return await db.transaction(async (tx) => {
		// Create the event record
		const [newEvent] = await tx
			.insert(events)
			.values({
				cafe_id: input.cafe_id,
				name: input.name,
				type: "football_match",
				start_time: new Date(input.start_time),
				base_price: input.base_price,
				total_capacity: input.total_capacity,
				remaining_capacity: input.remaining_capacity,
				status: "upcoming",
			})
			.returning();

		// Create football_match record
		await tx.insert(footballMatches).values({
			id: newEvent.id,
			match_id: input.match_id,
		});

		// Add event areas
		if (input.areas.length > 0) {
			const eventAreasToInsert = input.areas.map((areaId) => ({
				event_id: newEvent.id,
				area_id: areaId,
			}));

			await tx.insert(eventAreas).values(eventAreasToInsert);
		}

		// Add event packages
		if (input.packages && input.packages.length > 0) {
			const eventPackagesToInsert = input.packages.map((packageId) => ({
				event_id: newEvent.id,
				package_id: packageId,
			}));

			await tx.insert(eventPackages).values(eventPackagesToInsert);
		}

		return newEvent;
	});
}

export async function deleteMatchEvent(input: string) {
	try {
		await db.delete(events).where(eq(events.id, input));
	} catch (error) {
		console.error("Error deleting match event");
		throw error;
	}
}

export async function updateMatchEvent(input: EditMatchEntry) {
	try {
		return await db.transaction(async (tx) => {
			const [year, month, day] = input.date.split("-").map(Number);
			const [hours, minutes] = input.time.split(":").map(Number);
			const start_time = new Date(year, month - 1, day, hours, minutes);

			const [updateMatchEvent] = await tx
				.update(events)
				.set({
					name: input.match,
					total_capacity: input.capacity.total,
					remaining_capacity: input.capacity.remaining,
					status: input.status as
						| "upcoming"
						| "ongoing"
						| "completed"
						| "cancelled",
					start_time,
				})
				.where(eq(events.id, input.id))
				.returning();
			console.log(updateMatchEvent);
			return updateMatchEvent;
		});
	} catch (error) {
		console.error("Failed to update match event", error);
		throw error;
	}
}
