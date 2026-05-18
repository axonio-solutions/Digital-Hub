import { createFileRoute } from '@tanstack/react-router'
import { SellerAnalytics, AdminAnalyticsSkeleton } from '@/features/admin/components/seller-analytics'

export const Route = createFileRoute('/_authed/dashboard/admin/sellers')({
  loader: async ({ context }) => {
    const { getSellerAnalyticsServerFn } = await import('@/fn/admin')
    const { adminKeys } = await import('@/features/admin/hooks/use-admin')
    const promise = getSellerAnalyticsServerFn()
    await context.queryClient.ensureQueryData({
      queryKey: adminKeys.analytics('sellers'),
      queryFn: () => promise,
      staleTime: 5 * 60 * 1000,
    }).catch(() => {})
  },
  component: SellerAnalytics,
  pendingComponent: AdminAnalyticsSkeleton,
})
