import { createFileRoute } from '@tanstack/react-router'
import { SupportHub } from '@/features/support/components/support-hub'

export const Route = createFileRoute('/_authed/dashboard/support/')({
  component: SupportPageRoute,
})

function SupportPageRoute() {
  return <SupportHub />
}
