import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
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

    // Account Status Guard
    const status = user.account_status
    const isWaitlisted = status === 'waitlisted'
    const isNew = !status || status === 'new'
    
    // 1. If new, force onboarding
    if (isNew && location.pathname !== AUTH_ROUTES.COMPLETE_REGISTRATION) {
      throw redirect({
        to: AUTH_ROUTES.COMPLETE_REGISTRATION,
      })
    }

    // 2. If waitlisted, force waitlist page
    if (isWaitlisted && location.pathname !== AUTH_ROUTES.WAITLIST) {
      throw redirect({
        to: AUTH_ROUTES.WAITLIST,
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return <Outlet />
}
