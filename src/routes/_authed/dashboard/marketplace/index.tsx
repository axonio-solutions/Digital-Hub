import { createFileRoute, redirect } from '@tanstack/react-router'
import { MarketplaceHub } from '@/features/marketplace'

export const Route = createFileRoute('/_authed/dashboard/marketplace/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'seller' && context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: MarketplaceHub,
})
