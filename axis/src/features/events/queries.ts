import { fetchMatchEventsFn } from "@/fn/events";
import { queryOptions } from "@tanstack/react-query";

export const eventsQueries = {
	all: ["events"],
	matchEvents: () =>
		queryOptions({
			queryKey: [...eventsQueries.all, "matches"],
			queryFn: fetchMatchEventsFn,
			staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // Cached for 10 minutes
		}),
};
