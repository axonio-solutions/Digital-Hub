import * as React from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'

// 1. Dynamic Imports with Named Export Handling
const AdminLayout = React.lazy(() =>
  import('@/features/admin/components/layout/admin-layout').then((m) => ({ default: m.AdminLayout }))
)
const SellerLayout = React.lazy(() =>
  import('@/features/seller/components/layout/seller-layout').then((m) => ({ default: m.SellerLayout }))
)
const BuyerLayout = React.lazy(() =>
  import('@/features/buyer/components/layout/buyer-layout').then((m) => ({ default: m.BuyerLayout }))
)

// 2. Fallback Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full bg-muted/10">
      {/* Sidebar Skeleton */}
      <div className="w-64 h-full border-r bg-card p-4 space-y-4 hidden md:block">
        <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
        <div className="mt-8 space-y-4">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
        </div>
      </div>
      {/* Main Content Area Skeleton */}
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

function DashboardLayoutSelector() {
  const { data: user, isLoading } = useAuth()

  // Provide an immediate skeleton block while verifying session metadata
  if (isLoading) return <DashboardSkeleton />

  const role = user?.role || 'buyer'

  // 3. Render conditionally within Suspense Boundary
  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
      {role === 'admin' && (
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      )}
      {role === 'seller' && (
        <SellerLayout>
          <Outlet />
        </SellerLayout>
      )}
      {role === 'buyer' && (
        <BuyerLayout>
          <Outlet />
        </BuyerLayout>
      )}
    </React.Suspense>
  )
}

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardLayoutSelector,
  pendingComponent: DashboardSkeleton,
})
