import { createFileRoute, redirect } from '@tanstack/react-router'
import { BuyerRequestDetails } from '@/features/buyer'

export const Route = createFileRoute('/_authed/dashboard/requests/$requestId')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'buyer' && context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: BuyerRequestDetails,
})
