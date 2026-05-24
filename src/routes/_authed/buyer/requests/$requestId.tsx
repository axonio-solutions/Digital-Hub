import { createFileRoute } from '@tanstack/react-router'
import { BuyerRequestDetails } from '@/features/buyer'

export const Route = createFileRoute('/_authed/buyer/requests/$requestId')({
  component: BuyerRequestDetails,
})
