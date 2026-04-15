import { Outlet, createFileRoute } from '@tanstack/react-router'
import Navbar from '@/components/layout/navbar'

/**
 * _public layout — wraps all public-facing routes (/, /explore, etc.)
 * with the shared Navbar. No auth guard; accessible to anyone.
 *
 * TanStack Router file-based routing convention:
 *   routes/_public.tsx        → layout component (this file)
 *   routes/_public/index.tsx  → renders at /
 *   routes/_public/explore/   → renders at /explore
 */
export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <Outlet />
    </div>
  )
}
