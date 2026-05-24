import { createFileRoute, redirect } from '@tanstack/react-router'
import { BUYER_ROUTES } from '@/lib/routes'

export const Route = createFileRoute('/_authed/buyer/')({
  beforeLoad: () => {
    throw redirect({ to: BUYER_ROUTES.REQUESTS })
  },
})
