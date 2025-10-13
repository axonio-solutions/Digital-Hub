import ProductsPage from '@/components/products/products-components/ProductPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/digital-hub/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductsPage />
}
