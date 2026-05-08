import { createFileRoute, defer, redirect } from '@tanstack/react-router'
import { BuyerHub } from '@/features/buyer/components/buyer-hub'
import { BuyerSkeleton } from '@/features/buyer/components/buyer-skeleton'

export const Route = createFileRoute('/_authed/dashboard/requests/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'buyer' && context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async () => {
    const { fetchBuyerRequestsServerFn } = await import('@/fn/requests')
    const requestsPromise = fetchBuyerRequestsServerFn()
    return { buyerRequests: defer(requestsPromise) }
  },
  component: RequestsHubRoute,
  pendingComponent: BuyerSkeleton,
})

function RequestsHubRoute() {
  return <BuyerHub />
}
