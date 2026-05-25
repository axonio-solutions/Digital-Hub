import * as React from 'react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { DASHBOARD_ROUTES, ROLE_HOME } from '@/lib/routes'

const BuyerLayout = React.lazy(() =>
  import('@/features/buyer/components/layout/buyer-layout').then((m) => ({
    default: m.BuyerLayout,
  })),
)

function BuyerSkeleton() {
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

function BuyerLayoutRoute() {
  return (
    <React.Suspense fallback={<BuyerSkeleton />}>
      <BuyerLayout>
        <Outlet />
      </BuyerLayout>
    </React.Suspense>
  )
}

export const Route = createFileRoute('/_authed/buyer')({
  beforeLoad: ({ context }) => {
    const role = context.user?.role
    if (role !== 'buyer' && role !== 'admin') {
      throw redirect({
        to:
          ROLE_HOME[(role as keyof typeof ROLE_HOME) ?? 'buyer'] ||
          DASHBOARD_ROUTES.ROOT,
      })
    }
  },
  component: BuyerLayoutRoute,
  pendingComponent: BuyerSkeleton,
})
