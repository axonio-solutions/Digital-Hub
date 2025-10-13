import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/listings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardLayout>
           listings
           </DashboardLayout>
}
