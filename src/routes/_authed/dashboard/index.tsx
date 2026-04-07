import { createFileRoute, defer } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import type {User} from '@/lib/auth';
import { BuyerOverview } from '@/features/buyer'
import { SellerOverview } from '@/features/seller'
import { AdminOverview } from '@/features/admin/components/admin-overview'
import { useAuth } from '@/features/auth/hooks/use-auth'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async ({ context }) => {
    const role = (context.user as any)?.role || 'buyer'
    if (role === 'seller') {
      const { fetchSellerStatsServerFn } = await import('@/fn/quotes')
      const { fetchOpenRequestsServerFn } = await import('@/fn/requests')
      
      const statsPromise = fetchSellerStatsServerFn()
      const feedPromise = fetchOpenRequestsServerFn({ data: {} })
      
      return { 
        statsPromise: defer(statsPromise), 
        feedPromise: defer(feedPromise) 
      }
    }
    return {}
  },
  component: DashboardOverview,
})

function DashboardOverview() {
  const { data: user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const role = (user as any as User)?.role || 'buyer'

  if (role === 'admin') return <AdminOverview />
  if (role === 'seller') return <SellerOverview />

  return <BuyerOverview />
}
