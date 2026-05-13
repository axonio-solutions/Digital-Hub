import { createFileRoute } from '@tanstack/react-router'
import { PricingContent } from '@/components/pages/pricing-content'

export const Route = createFileRoute('/_public/pricing/')({
  component: PricingContent,
})
