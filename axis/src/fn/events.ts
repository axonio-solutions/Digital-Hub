import { authMiddleware } from "@/features/auth/guards/auth";
import {
	createFootballMatchSchema,
	editMatchEntrySchema,
	editMatchSchema,
	matchEventTableSchema,
} from "@/features/events/schema";
import type { CreateMatchInput } from "@/features/events/types";
import {
	createFootballMatchUseCase,
	deleteMatchEventUseCase,
	getMatchEventsUseCase,
	updateMatchEventUseCase,
} from "@/features/events/use-cases";
import { createServerFn } from "@tanstack/react-start";
import type { isReturnStatement } from "typescript";

export const fetchMatchEventsFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context: { cafeId } }) => {
		return await getMatchEventsUseCase(cafeId);
	});

export const createFootballMatchFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(createFootballMatchSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}

		const { formData, matchDetails } = data;

		let basePrice = 0;

		for (const area of formData.areas) {
			basePrice += Number(area.price);
		}

		for (const pkg of formData.packages) {
			basePrice += Number(pkg.price);
		}

		const areaIds = formData.areas.map((area) => area.id);
		const packageIds = formData.packages.map((pkg) => pkg.id);

		const input: CreateMatchInput = {
			cafe_id: cafeId,
			name: `${matchDetails.homeTeam} vs ${matchDetails.awayTeam}`,
			match_id: matchDetails.matchId,
			start_time: matchDetails.startTime,
			base_price: basePrice.toString(),
			total_capacity: formData.capacity,
			remaining_capacity: formData.capacity,
			areas: areaIds,
			packages: packageIds,
		};

		return await createFootballMatchUseCase(input);
	});

export const deleteMatchEventFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator((d: string) => d)
	.handler(async ({ data }) => {
		await deleteMatchEventUseCase(data);
	});

export const updateMatchEventFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(editMatchEntrySchema)
	.handler(async ({ data }) => {
		await updateMatchEventUseCase(data);
	});
