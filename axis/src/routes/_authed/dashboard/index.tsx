import { OverviewPage } from "@/features/overview/view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard/")({
	component: OverviewPage,
});
