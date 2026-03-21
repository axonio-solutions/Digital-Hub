import { fetchCafeOperatingHoursFn } from "@/fn/cafe";
import { queryOptions } from "@tanstack/react-query";

export const operatingHoursQueries = {
	all: ["cafe"],
	list: () =>
		queryOptions({
			queryKey: [...operatingHoursQueries.all, "operating-hours"],
			queryFn: fetchCafeOperatingHoursFn,
			staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // Cached for 10 minutes
		}),
};
