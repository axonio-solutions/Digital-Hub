import { queryOptions } from "@tanstack/react-query";
import { fetchCafeSocialMediaFn } from "@/fn/cafe-social-media";

export const cafeSocialMediaQueries = {
	all: ["cafe"],
	details: () =>
		queryOptions({
			queryKey: [...cafeSocialMediaQueries.all, "social-media"],
			queryFn: fetchCafeSocialMediaFn,
			staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // Cached for 10 minutes
		}),
};
