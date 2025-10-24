import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/dashboard")({
	component: RouteComponent,
});


function RouteComponent() {
	return (
<DashboardLayout><div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
                <Outlet/>
            </div>
            </div>
            </DashboardLayout>
        
    )}