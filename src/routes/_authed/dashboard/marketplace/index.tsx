import { createFileRoute } from '@tanstack/react-router'
import { SellerMarketplaceHub } from '@/features/quotes/components/seller-marketplace-hub'

export const Route = createFileRoute('/_authed/dashboard/marketplace/')({
  component: SellerMarketplaceHub,
})
