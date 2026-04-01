import { queryOptions } from "@tanstack/react-query";
import { fetchSeatingAreasFn } from "@/fn/seating-areas";

export const seatingAreasQueries = {
	all: ["areas"],
	list: () =>
		queryOptions({
			queryKey: [...seatingAreasQueries.all, "list"],
			queryFn: fetchSeatingAreasFn,
			staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // Cached for 10 minutes
		}),
};
