import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/features/overview/view";

export const Route = createFileRoute("/_authed/dashboard/")({
	component: OverviewPage,
});
