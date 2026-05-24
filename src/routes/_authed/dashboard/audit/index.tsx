import { createFileRoute, redirect } from '@tanstack/react-router'
import { ADMIN_ROUTES } from '@/lib/routes'

export const Route = createFileRoute('/_authed/dashboard/audit/')({
  beforeLoad: () => {
    throw redirect({ to: ADMIN_ROUTES.AUDIT_LOG })
  },
})
