import { ReservationsView } from "@/features/reservations/view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authed/dashboard/management/reservations",
)({
	component: ReservationsView,
});
