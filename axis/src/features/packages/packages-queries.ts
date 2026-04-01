import { queryOptions } from "@tanstack/react-query";
import { fetchPackagesFn } from "@/fn/packages";

export const packagesQueries = {
	all: ["packages"],
	list: () =>
		queryOptions({
			queryKey: [...packagesQueries.all, "list"],
			queryFn: fetchPackagesFn,
			staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		}),
};
