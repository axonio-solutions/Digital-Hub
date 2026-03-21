import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { AUTH_ROUTES } from '@/features/auth/constants/config'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    const { user } = context

    if (!user) {
      throw redirect({
        to: AUTH_ROUTES.LOGIN,
        search: {
          redirect: location.href,
        },
      })
    }

    // If registration is not complete, redirect to completion page
    // but ONLY if we are not already on that page to avoid infinite loops
    if (
      user.user_type === 'pending' && 
      location.pathname !== AUTH_ROUTES.COMPLETE_REGISTRATION
    ) {
      throw redirect({
        to: AUTH_ROUTES.COMPLETE_REGISTRATION,
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return <Outlet />
}

