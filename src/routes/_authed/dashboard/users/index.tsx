import { createFileRoute, redirect } from '@tanstack/react-router'
import { ADMIN_ROUTES } from '@/lib/routes'

export const Route = createFileRoute('/_authed/dashboard/users/')({
  beforeLoad: () => {
    throw redirect({ to: ADMIN_ROUTES.USERS })
  },
})
