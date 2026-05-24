import { createFileRoute } from '@tanstack/react-router'
import { SellerQuotesHub } from '@/features/seller'

export const Route = createFileRoute('/_authed/seller/quotes/')({
  component: SellerQuotesHub,
})
