import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardLayout/>
}
