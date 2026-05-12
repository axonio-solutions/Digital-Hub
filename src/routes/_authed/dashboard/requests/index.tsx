import { createFileRoute, redirect } from '@tanstack/react-router'
import { BuyerHub } from '@/features/buyer/components/buyer-hub'
import { BuyerSkeleton } from '@/features/buyer/components/buyer-skeleton'
import { buyerKeys } from '@/features/buyer/hooks/use-buyer'

export const Route = createFileRoute('/_authed/dashboard/requests/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'buyer' && context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ context }) => {
    const buyerId = context.user?.id
    if (buyerId) {
      const { fetchBuyerRequestsServerFn } = await import('@/fn/requests')
      await context.queryClient.ensureQueryData({
        queryKey: buyerKeys.requests(buyerId),
        queryFn: async () => {
          const res = await fetchBuyerRequestsServerFn()
          if (!res.success) throw new Error(res.error)
          return res.data
        },
        staleTime: 5 * 60 * 1000,
      }).catch(() => {})
    }
  },
  component: BuyerHub,
  pendingComponent: BuyerSkeleton,
})
