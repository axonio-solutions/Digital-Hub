import { serverEnvs } from "@/utils/env";
import { createServerFn } from "@tanstack/react-start";
import { addDays, format } from "date-fns";
import { z } from "zod";
import type { APIResponse, FixtureResponse } from "./types/fixtures";

export const eventsKeys = {
	all: ["events"] as const,
	fixtures: () => [...eventsKeys.all, "fixtures"] as const,
	upcomingFixtures: (leagueId: number, season: number) =>
		[...eventsKeys.fixtures(), leagueId, season] as const,
};

const FixturesRequestSchema = z.object({
	leagueId: z.number({
		required_error: "League ID is required",
		invalid_type_error: "League ID must be a number",
	}),
});

type FixturesRequest = z.infer<typeof FixturesRequestSchema>;

export const getUpcomingFixtures = createServerFn({
	method: "GET",
	response: "data",
})
	.validator((input: unknown): FixturesRequest => {
		if (typeof input !== "object" || input === null) {
			throw new Error("Input must be an object");
		}

		return FixturesRequestSchema.parse(input);
	})
	.handler(async ({ data }) => {
		const { leagueId } = data;
		const currentDate = new Date();
		const endDate = addDays(currentDate, 21); // Next 3 weeks
		const seasonYear = currentDate.getFullYear() - 1;

		const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";

		const API_KEY = serverEnvs.RAPIDAPI_KEY;

		if (!API_KEY) {
			throw new Error(
				"API key is missing. Please set RAPIDAPI_KEY environment variable.",
			);
		}

		const params = {
			league: leagueId,
			season: seasonYear,
			status: "NS", // Not Started
			from: format(currentDate, "yyyy-MM-dd"),
			to: format(endDate, "yyyy-MM-dd"),
			timezone: "Asia/Riyadh",
		};

		const queryString = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			queryString.append(key, value.toString());
		}

		try {
			const response = await fetch(`${BASE_URL}/fixtures?${queryString}`, {
				headers: {
					"X-RapidAPI-Key": API_KEY,
					"X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
				},
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			const data = (await response.json()) as APIResponse<FixtureResponse>;

			const sortedData = {
				...data,
				response: [...data.response].sort(
					(a, b) =>
						new Date(a.fixture.date).getTime() -
						new Date(b.fixture.date).getTime(),
				),
			};

			return sortedData;
		} catch (error) {
			console.error("Error fetching fixtures:", error);
			if (error instanceof Error) {
				throw new Error(`Failed to fetch fixtures: ${error.message}`);
			}
			throw new Error("An unexpected error occurred");
		}
	});
