import { createFileRoute, redirect } from '@tanstack/react-router'
import { RequestDetailPage } from '@/features/marketplace/components/request-detail-page'

export const Route = createFileRoute('/_authed/marketplace/$requestId')({
  beforeLoad: ({ context }) => {
    const role = (context.user as any)?.role
    if (role !== 'seller' && role !== 'admin') {
      throw redirect({ to: '/explore' } as any)
    }
  },
  component: RequestDetailPage,
})
