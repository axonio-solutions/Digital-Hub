import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { eventsKeys, getUpcomingFixtures } from "../fixtures-fn";
import type { APIResponse, FixtureResponse } from "../types/fixtures";

export function useUpcomingFixtures(leagueId?: number) {
	const currentYear = new Date().getFullYear();
	const fetchFixtures = useServerFn(getUpcomingFixtures);

	return useQuery<APIResponse<FixtureResponse>, Error>({
		queryKey: eventsKeys.upcomingFixtures(leagueId || 0, currentYear),
		queryFn: async () => fetchFixtures({ data: { leagueId } }),
		enabled: Boolean(leagueId),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: false,
		select: (data) => {
			if (!data || !Array.isArray(data.response)) {
				return {
					...data,
					response: [],
				};
			}

			return data;
		},
	});
}
