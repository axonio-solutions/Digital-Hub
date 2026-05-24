import { createFileRoute } from '@tanstack/react-router'
import { BillingOverview } from '@/features/seller/components/billing-overview'

export const Route = createFileRoute('/_authed/seller/billing/')({
  component: BillingOverview,
})
