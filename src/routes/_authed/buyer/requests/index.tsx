import { createFileRoute } from '@tanstack/react-router'
import { BuyerHub } from '@/features/buyer/components/buyer-hub'
import { BuyerSkeleton } from '@/features/buyer/components/buyer-skeleton'
import { buyerKeys } from '@/features/buyer/hooks/use-buyer'
import { RouteErrorFallback } from '@/routes/components/errors/route-error-fallback'

export const Route = createFileRoute('/_authed/buyer/requests/')({
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
      })
    }
  },
  component: BuyerHub,
  pendingComponent: BuyerSkeleton,
  errorComponent: RouteErrorFallback,
})
