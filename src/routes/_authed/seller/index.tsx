import { createFileRoute, redirect } from '@tanstack/react-router'
import { SELLER_ROUTES } from '@/lib/routes'

export const Route = createFileRoute('/_authed/seller/')({
  beforeLoad: () => {
    throw redirect({ to: SELLER_ROUTES.QUOTES })
  },
})
