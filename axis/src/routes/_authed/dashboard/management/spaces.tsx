import { createFileRoute } from "@tanstack/react-router";
import { cafesQueries } from "@/features/setup/components/information/informations.queries";
import { seatingAreasQueries } from "@/features/spaces/components/seating-areas/seating-areas.queries";
import { SpacesView } from "@/features/spaces/view";

export const Route = createFileRoute("/_authed/dashboard/management/spaces")({
	loader : ({context})=>{
		context.queryClient.prefetchQuery(seatingAreasQueries.list());

		const existingCafeDetails = context.queryClient.getQueryData(
			cafesQueries.details().queryKey,
		);
		if (existingCafeDetails) {
			context.queryClient.setQueryData(cafesQueries.space().queryKey, {
				max_capacity: existingCafeDetails.max_capacity,
				advance_booking_window: existingCafeDetails.advance_booking_window,
				booking_duration: existingCafeDetails.booking_duration,
				cancellation_policy: existingCafeDetails.cancellation_policy,
			});
		} else {
			context.queryClient.prefetchQuery(cafesQueries.space());
		}
	},
	component: SpacesView,
});
