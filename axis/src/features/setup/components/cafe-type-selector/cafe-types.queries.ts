import { queryOptions,} from "@tanstack/react-query";
import { fetchCafeTypesFn } from "@/fn/cafe-types";

export const cafeTypesQueries = {
	all: ["cafe"],
	list: () =>
		queryOptions({
			queryKey: [...cafeTypesQueries.all, "types"],
			queryFn: fetchCafeTypesFn,
			staleTime: Number.POSITIVE_INFINITY,
			gcTime: Number.POSITIVE_INFINITY,
		}),
};

