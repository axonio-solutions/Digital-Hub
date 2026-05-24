import { createFileRoute } from '@tanstack/react-router'
import { RequestDetailPage } from '@/features/marketplace/components/request-detail-page'

export const Route = createFileRoute('/_authed/requests/$requestId')({
  component: RequestDetailPage,
})
