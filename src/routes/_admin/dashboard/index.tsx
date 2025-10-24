import { createFileRoute } from '@tanstack/react-router'
import { ChartAreaInteractive } from '@/components/admin/dashboard-layout-components/chart-area-interactive'
import { DataTable } from '@/components/admin/dashboard-layout-components/data-table'
import { SectionCards } from '@/components/admin/dashboard-layout-components/section-cards'
export const Route = createFileRoute('/_admin/dashboard/')({
  component: RouteComponent,
})

import data from "./data.json"


function RouteComponent() {
  return  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          
  
 
}
