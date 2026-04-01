import { createFileRoute } from '@tanstack/react-router'
import { PublicMarketplace } from '@/features/marketplace'

export const Route = createFileRoute('/explore/')({
  component: PublicMarketplaceRoute,
})

function PublicMarketplaceRoute() {
  return <PublicMarketplace />
}
