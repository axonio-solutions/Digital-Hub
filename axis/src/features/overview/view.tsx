import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { PendingReservationsCard } from "./components/pending-reservations-card";
import { UpcomingEventsCard } from "./components/upcoming-events-card";

export const OverviewPage = () => {
  const router = useRouter();

		useEffect(() => {
			async function preload() {
				try {
					await router.preloadRoute({ to: "/dashboard/management/setup" });
				} catch (err) {}
			}

			preload();
		}, [router]);
		return (
			<>
				<SectionCards />
				<div className="px-4 lg:px-6 grid grid-cols-1 gap-6 py-6 @xl/main:grid-cols-4">
					<div className="@xl/main:col-span-4">
						<ChartAreaInteractive />
					</div>
					<div className="@xl/main:col-span-2">
						<PendingReservationsCard />
					</div>
					<div className="@xl/main:col-span-2">
						<UpcomingEventsCard />
					</div>
				</div>
			</>
		);
};
