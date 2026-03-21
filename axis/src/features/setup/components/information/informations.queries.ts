import { fetchCafeInformationFn, fetchSpaceSettingsFn } from "@/fn/cafe";
import { queryOptions } from "@tanstack/react-query";

export const cafesQueries = {
	all: ["cafe"],
	details: () =>
		queryOptions({
			queryKey: [...cafesQueries.all, "details"],
			queryFn: fetchCafeInformationFn,
			staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // Cached for 10 minutes
		}),
	space: () =>
		queryOptions({
			queryKey: [...cafesQueries.all, "space-settings"],
			queryFn: fetchSpaceSettingsFn,
			staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // Cached for 10 minutes
		}),
};
