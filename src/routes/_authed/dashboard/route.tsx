import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AdminLayout } from '@/features/admin/components/layout/admin-layout'
import { SellerLayout } from '@/features/seller/components/layout/seller-layout'
import { BuyerLayout } from '@/features/buyer/components/layout/buyer-layout'
import { useAuth } from '@/features/auth/hooks/use-auth'

function DashboardLayoutSelector() {
  const { data: user, isLoading } = useAuth()

  if (isLoading) return null // Or a loading shell

  const role = user?.role || 'buyer'

  if (role === 'admin') return <AdminLayout><Outlet /></AdminLayout>
  if (role === 'seller') return <SellerLayout><Outlet /></SellerLayout>
  return <BuyerLayout><Outlet /></BuyerLayout>
}

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardLayoutSelector,
})
