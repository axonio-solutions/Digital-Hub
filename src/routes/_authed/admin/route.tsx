import * as React from 'react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { DASHBOARD_ROUTES } from '@/lib/routes'

const AdminLayout = React.lazy(() =>
  import('@/features/admin/components/layout/admin-layout').then((m) => ({
    default: m.AdminLayout,
  })),
)

function AdminSkeleton() {
  return (
    <div className="flex h-screen w-full bg-muted/10">
      <div className="w-64 h-full border-r bg-card p-4 space-y-4 hidden md:block">
        <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
        <div className="mt-8 space-y-4">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="flex-1 p-8 space-y-8">
        <div className="h-10 w-1/4 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
        </div>
        <div className="h-96 w-full bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  )
}

function AdminLayoutRoute() {
  return (
    <React.Suspense fallback={<AdminSkeleton />}>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </React.Suspense>
  )
}

export const Route = createFileRoute('/_authed/admin')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: DASHBOARD_ROUTES.ROOT })
    }
  },
  component: AdminLayoutRoute,
  pendingComponent: AdminSkeleton,
})
