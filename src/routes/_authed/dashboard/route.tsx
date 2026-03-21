import { createFileRoute } from '@tanstack/react-router'
import { UnifiedDashboardLayout } from '@/features/dashboard/components/unified-layout'

export const Route = createFileRoute('/_authed/dashboard')({
  component: UnifiedDashboardLayout,
})
