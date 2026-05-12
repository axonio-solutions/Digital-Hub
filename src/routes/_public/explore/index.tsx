import { createFileRoute } from '@tanstack/react-router'
import { PublicMarketplace } from '@/features/marketplace'

export const Route = createFileRoute('/_public/explore/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: PublicMarketplaceRoute,
})

function PublicMarketplaceRoute() {
  return <PublicMarketplace />
}
