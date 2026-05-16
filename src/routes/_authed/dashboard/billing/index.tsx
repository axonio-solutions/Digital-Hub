import { createFileRoute, redirect } from '@tanstack/react-router'
import { BillingOverview } from '@/features/seller/components/billing-overview'

export const Route = createFileRoute('/_authed/dashboard/billing/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'seller' && context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: BillingOverview,
})
