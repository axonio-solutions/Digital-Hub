import { createFileRoute, redirect } from '@tanstack/react-router'
import { SellerQuotesHub } from '@/features/quotes/components/seller-quotes-hub'

export const Route = createFileRoute('/_authed/dashboard/quotes/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'seller') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SellerQuotesHub,
})
