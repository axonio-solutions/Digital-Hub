import { AccountView } from "@/features/account/account-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard/settings")({
	component: AccountView,
});
