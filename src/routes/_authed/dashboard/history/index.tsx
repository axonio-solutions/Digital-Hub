import { createFileRoute } from '@tanstack/react-router'
import { OrderHistory } from '@/features/buyer/components/order-history'

export const Route = createFileRoute('/_authed/dashboard/history/')({
  component: HistoryRoute,
})

function HistoryRoute() {
  return <OrderHistory />
}
