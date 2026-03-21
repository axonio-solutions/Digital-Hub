import { eventsQueries } from "@/features/events/queries";
import { EventsView } from "@/features/events/view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard/management/events")({
	loader: async ({ context }) => {
		context.queryClient.ensureQueryData(eventsQueries.matchEvents());
	},
	component: EventsView,
});
