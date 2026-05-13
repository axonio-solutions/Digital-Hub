import { createFileRoute } from '@tanstack/react-router'
import { ContactContent } from '@/components/pages/contact-content'

export const Route = createFileRoute('/_public/contact/')({
  component: ContactContent,
})
