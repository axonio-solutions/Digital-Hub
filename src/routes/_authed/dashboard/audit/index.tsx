import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect old route to new consolidated admin path
export const Route = createFileRoute('/_authed/dashboard/audit/')({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard/admin/audit' })
  },
})
