import { createFileRoute } from '@tanstack/react-router'
import { BuyerOverview } from '@/features/requests/components/buyer-overview'
import { SellerOverview } from '@/features/quotes/components/seller-overview'
import { AdminOverview } from '@/features/admin/components/admin-overview'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Loader2 } from 'lucide-react'

import { type User } from '@/lib/auth'

export const Route = createFileRoute('/_authed/dashboard/')({
  component: DashboardOverview,
})

function DashboardOverview() {
  const { data: user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  }

  const role = (user as any as User)?.role || 'buyer'

  if (role === 'admin') return <AdminOverview />
  if (role === 'seller') return <SellerOverview />

  return <BuyerOverview />
}
