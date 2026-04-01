import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard/admin')({
  beforeLoad: ({ context }) => {
    // Systemic Guard: Protect all child routes in /dashboard/admin
    if (context.user?.role !== 'admin') {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
})
