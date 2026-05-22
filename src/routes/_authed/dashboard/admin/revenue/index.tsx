import { createFileRoute } from '@tanstack/react-router'
import {
  RevenueRoute,
  RevenueSkeleton,
} from '@/features/credits/components/revenue-route'
import { RouteErrorFallback } from '@/routes/components/errors/route-error-fallback'

export const Route = createFileRoute('/_authed/dashboard/admin/revenue/')({
  loader: async ({ context }) => {
    const { creditKeys } = await import('@/features/credits/hooks/use-credits')
    const { getRevenueMetricsServerFn, getCreditTransactionsServerFn } =
      await import('@/fn/credits')
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: creditKeys.revenue(),
        queryFn: () => (getRevenueMetricsServerFn as any)(),
        staleTime: 2 * 60 * 1000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: [...creditKeys.transactions(), undefined],
        queryFn: () => (getCreditTransactionsServerFn as any)({ data: {} }),
        staleTime: 30 * 1000,
      }),
    ])
  },
  component: RevenueRoute,
  pendingComponent: RevenueSkeleton,
  errorComponent: RouteErrorFallback,
})
