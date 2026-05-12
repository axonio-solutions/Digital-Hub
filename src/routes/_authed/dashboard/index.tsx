import { createFileRoute, defer } from '@tanstack/react-router'
import type { User } from '@/lib/auth'
import { BuyerOverview } from '@/features/buyer'
import { SellerOverview } from '@/features/seller'
import { AdminOverview } from '@/features/admin/components/admin-overview'
import { sellerKeys } from '@/features/marketplace/hooks/use-marketplace'
import { adminKeys } from '@/features/admin/hooks/use-admin'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async ({ context }) => {
    const role = (context.user)?.role || 'buyer'
    if (role === 'seller') {
      const { fetchSellerStatsServerFn } = await import('@/fn/quotes')
      const statsPromise = fetchSellerStatsServerFn()
      await context.queryClient.ensureQueryData({
        queryKey: sellerKeys.dashboard(context.user.id),
        queryFn: async () => await statsPromise,
        staleTime: 60 * 1000,
      }).catch(() => {})
      return { statsPromise: defer(statsPromise) }
    }
    if (role === 'buyer') {
      const { fetchBuyerRequestsServerFn } = await import('@/fn/requests')
      const buyerId = (context.user)?.id
      if (buyerId) {
        const requestsPromise = fetchBuyerRequestsServerFn()
        return { buyerRequests: defer(requestsPromise) }
      }
    }
    if (role === 'admin') {
      const { getAdminDashboardStatsServerFn } = await import('@/fn/admin')
      const { getAdvancedSystemMetricsServerFn } = await import('@/fn/admin')
      const { getRecentActivityServerFn } = await import('@/fn/admin')
      const statsPromise = getAdminDashboardStatsServerFn()
      const metricsPromise = getAdvancedSystemMetricsServerFn()
      const activityPromise = getRecentActivityServerFn()
      await Promise.allSettled([
        context.queryClient.ensureQueryData({
          queryKey: adminKeys.dashboardStats(),
          queryFn: () => (statsPromise as any),
          staleTime: 60 * 1000,
        }),
        context.queryClient.ensureQueryData({
          queryKey: adminKeys.systemMetrics(),
          queryFn: () => (metricsPromise as any),
          staleTime: 2 * 60 * 1000,
        }),
        context.queryClient.ensureQueryData({
          queryKey: adminKeys.recentActivity(),
          queryFn: () => (activityPromise as any),
          staleTime: 30 * 1000,
        }),
      ])
      return {}
    }
    return {}
  },
  component: DashboardOverview,
})

function DashboardOverview() {
  const { user } = Route.useRouteContext()

  const role = (user as User).role || 'buyer'

  if (role === 'admin') return <AdminOverview />
  if (role === 'seller') return <SellerOverview />

  return <BuyerOverview />
}
