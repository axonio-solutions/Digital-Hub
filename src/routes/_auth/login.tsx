import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthForm } from '@/features/auth/components/auth-form'
import { ThemeToggle } from '@/components/theme-toggle'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async ({ context, search }) => {
    if (context.user) {
      throw redirect({
        to: (search as any).redirect || '/dashboard',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg">
        <AuthForm />
      </div>
    </div>
  )
}
