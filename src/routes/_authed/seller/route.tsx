import * as React from 'react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { ROLE_HOME, DASHBOARD_ROUTES } from '@/lib/routes'

const SellerLayout = React.lazy(() =>
  import('@/features/seller/components/layout/seller-layout').then((m) => ({
    default: m.SellerLayout,
  })),
)

function SellerSkeleton() {
  return (
    <div className="flex h-screen w-full bg-muted/10">
      <div className="w-64 h-full border-r bg-card p-4 space-y-4 hidden md:block">
        <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
        <div className="mt-8 space-y-4">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="flex-1 p-8 space-y-8">
        <div className="h-10 w-1/4 bg-muted animate-pulse rounded" />
        <div className="h-96 w-full bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  )
}

function SellerLayoutRoute() {
  return (
    <React.Suspense fallback={<SellerSkeleton />}>
      <SellerLayout>
        <Outlet />
      </SellerLayout>
    </React.Suspense>
  )
}

export const Route = createFileRoute('/_authed/seller')({
  beforeLoad: ({ context }) => {
    const role = context.user?.role
    if (role !== 'seller' && role !== 'admin') {
      throw redirect({
        to:
          ROLE_HOME[(role as keyof typeof ROLE_HOME) ?? 'seller'] ||
          DASHBOARD_ROUTES.ROOT,
      })
    }
  },
  component: SellerLayoutRoute,
  pendingComponent: SellerSkeleton,
})
