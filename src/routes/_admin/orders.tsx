import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  return  <DashboardLayout>
             <div>Hello "/admin/orders"!</div>
             </DashboardLayout>
  
}
