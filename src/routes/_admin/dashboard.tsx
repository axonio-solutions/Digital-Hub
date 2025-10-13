import { createFileRoute } from '@tanstack/react-router'
import { ChartAreaInteractive } from '@/components/admin/dashboard-layout-components/chart-area-interactive'
import { DataTable } from '@/components/admin/dashboard-layout-components/data-table'
import { SectionCards } from '@/components/admin/dashboard-layout-components/section-cards'
export const Route = createFileRoute('/_admin/dashboard')({
  component: RouteComponent,
})

import data from "./data.json"
import DashboardLayout from '@/components/dashboard/DashboardLayout'


function RouteComponent() {
  return <DashboardLayout><div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div> </DashboardLayout>
  
 
}
