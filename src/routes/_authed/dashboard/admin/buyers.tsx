import { createFileRoute, redirect } from '@tanstack/react-router'
import { BuyerAnalytics } from '@/features/admin/components/buyer-analytics'
import { Skeleton } from '@/components/ui/skeleton'

function BuyerAnalyticsSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-8 w-full pb-20 pt-2 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[300px] w-full rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-[300px] w-full rounded-2xl" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  )
}

export const Route = createFileRoute('/_authed/dashboard/admin/buyers')({
  beforeLoad: ({ context }: any) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: BuyerAnalytics,
  pendingComponent: BuyerAnalyticsSkeleton,
})
