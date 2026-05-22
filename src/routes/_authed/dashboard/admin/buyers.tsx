import { createFileRoute } from '@tanstack/react-router'
import {
  AdminAnalyticsSkeleton,
  BuyerAnalytics,
} from '@/features/admin/components/buyer-analytics'
import { RouteErrorFallback } from '@/routes/components/errors/route-error-fallback'

export const Route = createFileRoute('/_authed/dashboard/admin/buyers')({
  loader: async ({ context }) => {
    const { getBuyerAnalyticsServerFn } = await import('@/fn/admin')
    const { adminKeys } = await import('@/features/admin/hooks/use-admin')
    await context.queryClient.ensureQueryData({
      queryKey: adminKeys.analytics('buyers'),
      queryFn: () => getBuyerAnalyticsServerFn(),
      staleTime: 5 * 60 * 1000,
    })
  },
  component: BuyerAnalytics,
  pendingComponent: AdminAnalyticsSkeleton,
  errorComponent: RouteErrorFallback,
})
