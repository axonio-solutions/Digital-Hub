import { fetchAllCafeCategoriesFn } from "@/fn/cafe-categories";
import { queryOptions } from "@tanstack/react-query";

export const cafeCategoriesQueries = {
	all: ["cafe"],
	list: () =>
		queryOptions({
			queryKey: [...cafeCategoriesQueries.all, "categories"],
			queryFn: fetchAllCafeCategoriesFn,
			staleTime: Number.POSITIVE_INFINITY,
			gcTime: Number.POSITIVE_INFINITY,
		}),
};
