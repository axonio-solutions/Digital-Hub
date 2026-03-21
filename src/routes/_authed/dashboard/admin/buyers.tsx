import { createFileRoute, redirect } from '@tanstack/react-router'
import { BuyerAnalytics } from '@/features/admin/components/buyer-analytics'

export const Route = createFileRoute('/_authed/dashboard/admin/buyers')({
    beforeLoad: ({ context }: any) => {
        if (context.user?.role !== 'admin') {
            throw redirect({ to: '/dashboard' })
        }
    },
    component: AdminBuyersRoute,
})

function AdminBuyersRoute() {
    return <BuyerAnalytics />
}
