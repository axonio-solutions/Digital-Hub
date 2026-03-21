import { createFileRoute, redirect } from '@tanstack/react-router'
import { SellerAnalytics } from '@/features/admin/components/seller-analytics'

export const Route = createFileRoute('/_authed/dashboard/admin/sellers')({
  beforeLoad: ({ context }: any) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminSellersRoute,
})

function AdminSellersRoute() {
  return <SellerAnalytics />
}
