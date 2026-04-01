import {
	createFootballMatch,
	deleteMatchEvent,
	getMatchEvents,
	updateMatchEvent,
} from "./data-access";
import { formatArabicDateTime } from "./helpers";
import type {
	EditMatchEntry,
	EditMatchFormValues,
	MatchEventTableRow,
} from "./schema";
import type { CreateMatchInput } from "./types";

export async function getMatchEventsUseCase(cafeId: string): Promise<Array<MatchEventTableRow>> {
	try {
		const data = await getMatchEvents(cafeId);
		return data.map((e) => ({
			id: e.id,
			match: e.name,
			date: formatArabicDateTime(e.start_time).date,
			time: formatArabicDateTime(e.start_time).time,
			capacity: {
				total: e.total_capacity,
				remaining: e.remaining_capacity,
			},
			status: e.status,
		}));
	} catch (error) {
		console.error("Error fetching match events:", error);
		throw error;
	}
}

export async function createFootballMatchUseCase(input: CreateMatchInput) {
	try {
		const result = await createFootballMatch(input);
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error("Error creating football match:", error);
		return {
			success: false,
			error: "حدث خطأ أثناء إنشاء المباراة",
		};
	}
}

export async function deleteMatchEventUseCase(input: string) {
	try {
		await deleteMatchEvent(input);
	} catch (error) {
		console.error("Error deleting match event", error);
		throw error;
	}
}

export async function updateMatchEventUseCase(input: EditMatchEntry) {
	try {
		const result = await updateMatchEvent(input);
		return result;
	} catch (error) {
		console.error("Error updating match event : ", error);
		throw error;
	}
}
