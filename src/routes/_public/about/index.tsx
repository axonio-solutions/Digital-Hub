import { createFileRoute } from '@tanstack/react-router'
import { AboutContent } from '@/components/pages/about-content'

export const Route = createFileRoute('/_public/about/')({
  component: AboutContent,
})
