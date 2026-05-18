import { createFileRoute } from '@tanstack/react-router'
import { BuyerAnalytics, AdminAnalyticsSkeleton } from '@/features/admin/components/buyer-analytics'

export const Route = createFileRoute('/_authed/dashboard/admin/buyers')({
  loader: async ({ context }) => {
    const { getBuyerAnalyticsServerFn } = await import('@/fn/admin')
    const { adminKeys } = await import('@/features/admin/hooks/use-admin')
    const promise = getBuyerAnalyticsServerFn()
    await context.queryClient.ensureQueryData({
      queryKey: adminKeys.analytics('buyers'),
      queryFn: () => promise,
      staleTime: 5 * 60 * 1000,
    }).catch(() => {})
  },
  component: BuyerAnalytics,
  pendingComponent: AdminAnalyticsSkeleton,
})
