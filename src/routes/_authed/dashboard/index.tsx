import { createFileRoute, defer } from '@tanstack/react-router'
import type {User} from '@/lib/auth';
import { BuyerOverview } from '@/features/buyer'
import { SellerOverview } from '@/features/seller'
import { AdminOverview } from '@/features/admin/components/admin-overview'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async ({ context }) => {
    const role = (context.user as any)?.role || 'buyer'
    if (role === 'seller') {
      const { fetchSellerStatsServerFn } = await import('@/fn/quotes')
      
      const statsPromise = fetchSellerStatsServerFn()
      
      return { 
        statsPromise: defer(statsPromise), 
      }
    }
    return {}
  },
  component: DashboardOverview,
})

function DashboardOverview() {
  const { user } = Route.useRouteContext()

  const role = (user as any as User)?.role || 'buyer'

  if (role === 'admin') return <AdminOverview />
  if (role === 'seller') return <SellerOverview />

  return <BuyerOverview />
}
