import { createFileRoute } from '@tanstack/react-router'
import { PublicMarketplace } from '@/features/marketplace'

export const Route = createFileRoute('/_public/explore/')({
  component: PublicMarketplaceRoute,
})

function PublicMarketplaceRoute() {
  return <PublicMarketplace />
}
