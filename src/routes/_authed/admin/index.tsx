import { createFileRoute, redirect } from '@tanstack/react-router'
import { DASHBOARD_ROUTES } from '@/lib/routes'

export const Route = createFileRoute('/_authed/admin/')({
  beforeLoad: () => {
    throw redirect({ to: DASHBOARD_ROUTES.ROOT })
  },
})
