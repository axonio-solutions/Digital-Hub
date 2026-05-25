import { createFileRoute, defer } from '@tanstack/react-router'
import type { User } from '@/lib/auth'
import { BuyerOverview } from '@/features/buyer'
import { SellerOverview } from '@/features/seller'
import { AdminOverview } from '@/features/admin/components/admin-overview'
import { sellerKeys } from '@/features/marketplace/hooks/use-marketplace'
import { adminKeys } from '@/features/admin/hooks/use-admin'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async ({ context }) => {
    const role = context.user?.role || 'buyer'
    if (role === 'seller') {
      const { fetchSellerStatsServerFn } = await import('@/fn/quotes')
      await context.queryClient.ensureQueryData({
        queryKey: sellerKeys.dashboard(context.user.id),
        queryFn: () =>
          fetchSellerStatsServerFn({
            data: { tzOffset: new Date().getTimezoneOffset() },
          }),
        staleTime: 60 * 1000,
      })
      return {}
    }
    if (role === 'buyer') {
      const { fetchBuyerRequestsServerFn } = await import('@/fn/requests')
      const buyerId = context.user?.id
      if (buyerId) {
        const requestsPromise = fetchBuyerRequestsServerFn()
        return { buyerRequests: defer(requestsPromise) }
      }
    }
    if (role === 'admin') {
      const {
        getAdminDashboardStatsServerFn,
        getAdvancedSystemMetricsServerFn,
        getMarketGapAnalysisServerFn,
      } = await import('@/fn/admin')
      await Promise.allSettled([
        context.queryClient.ensureQueryData({
          queryKey: [...adminKeys.dashboardStats(), 30],
          queryFn: () =>
            getAdminDashboardStatsServerFn({ data: { days: 30 } }) as any,
          staleTime: 2 * 60 * 1000,
        }),
        context.queryClient.ensureQueryData({
          queryKey: [...adminKeys.systemMetrics(), 30],
          queryFn: () =>
            getAdvancedSystemMetricsServerFn({ data: { days: 30 } }) as any,
          staleTime: 2 * 60 * 1000,
        }),
        context.queryClient.ensureQueryData({
          queryKey: adminKeys.marketGap(),
          queryFn: () => getMarketGapAnalysisServerFn() as any,
          staleTime: 2 * 60 * 1000,
        }),
      ])
      return {}
    }
    return {}
  },
  component: DashboardOverview,
  errorComponent: () => <h1>error</h1>,
})

function DashboardOverview() {
  const { user } = Route.useRouteContext()

  const role = (user as User).role || 'buyer'

  if (role === 'admin') return <AdminOverview />
  if (role === 'seller') return <SellerOverview />

  return <BuyerOverview />
}
