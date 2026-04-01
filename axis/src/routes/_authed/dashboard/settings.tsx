import { createFileRoute } from "@tanstack/react-router";
import { AccountView } from "@/features/account/account-view";

export const Route = createFileRoute("/_authed/dashboard/settings")({
	component: AccountView,
});
