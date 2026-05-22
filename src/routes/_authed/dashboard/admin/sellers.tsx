import { createFileRoute } from '@tanstack/react-router'
import {
  AdminAnalyticsSkeleton,
  SellerAnalytics,
} from '@/features/admin/components/seller-analytics'
import { RouteErrorFallback } from '@/routes/components/errors/route-error-fallback'

export const Route = createFileRoute('/_authed/dashboard/admin/sellers')({
  loader: async ({ context }) => {
    const { getSellerAnalyticsServerFn } = await import('@/fn/admin')
    const { adminKeys } = await import('@/features/admin/hooks/use-admin')
    await context.queryClient.ensureQueryData({
      queryKey: adminKeys.analytics('sellers'),
      queryFn: () => getSellerAnalyticsServerFn(),
      staleTime: 5 * 60 * 1000,
    })
  },
  component: SellerAnalytics,
  pendingComponent: AdminAnalyticsSkeleton,
  errorComponent: RouteErrorFallback,
})
