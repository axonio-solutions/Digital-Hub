import { createFileRoute } from '@tanstack/react-router'
import { FaqContent } from '@/components/pages/faq-content'

export const Route = createFileRoute('/_public/faq/')({
  component: FaqContent,
})
