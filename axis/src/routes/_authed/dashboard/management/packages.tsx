import { packagesQueries } from "@/features/packages/packages-queries";
import { PackagesView } from "@/features/packages/view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard/management/packages")({
	loader: async ({ context }) => {
		context.queryClient.ensureQueryData(packagesQueries.list());
	},
	component: PackagesView,
});
