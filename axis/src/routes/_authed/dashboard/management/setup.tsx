import { createFileRoute } from "@tanstack/react-router";
import { cafeCategoriesQueries } from "@/features/setup/components/cafe-categories-selector/cafe-categories.queries";
import { cafeSocialMediaQueries } from "@/features/setup/components/cafe-social-media/cafe-social-media.queries";
import { cafeTypesQueries } from "@/features/setup/components/cafe-type-selector/cafe-types.queries";
import { cafesQueries } from "@/features/setup/components/information/informations.queries";
import { operatingHoursQueries } from "@/features/setup/components/operating-hours/lib/queries";
import { SetupView } from "@/features/setup/view";

export const Route = createFileRoute("/_authed/dashboard/management/setup")({
	loader: async ({ context }) => {
		context.queryClient.prefetchQuery(cafesQueries.details());

		context.queryClient.prefetchQuery(cafeTypesQueries.list());
		context.queryClient.prefetchQuery(cafeCategoriesQueries.list());
		context.queryClient.prefetchQuery(operatingHoursQueries.list());
		context.queryClient.prefetchQuery(cafeSocialMediaQueries.details());
	},
	component: SetupView,
});
