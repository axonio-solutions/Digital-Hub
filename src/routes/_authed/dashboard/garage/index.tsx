import { createFileRoute } from '@tanstack/react-router'
import { GarageDashboard } from '@/features/garage/components/garage-dashboard'

export const Route = createFileRoute('/_authed/dashboard/garage/')({
  component: GarageRoute,
})

function GarageRoute() {
  return <GarageDashboard />
}
