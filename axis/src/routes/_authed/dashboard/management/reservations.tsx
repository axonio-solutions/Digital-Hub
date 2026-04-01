import { createFileRoute } from "@tanstack/react-router";
import { ReservationsView } from "@/features/reservations/view";

export const Route = createFileRoute(
	"/_authed/dashboard/management/reservations",
)({
	component: ReservationsView,
});
