import { createFileRoute, redirect } from '@tanstack/react-router'
import { SellerQuotesHub } from '@/features/seller'

export const Route = createFileRoute('/_authed/dashboard/quotes/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'seller' && context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SellerQuotesHub,
})
