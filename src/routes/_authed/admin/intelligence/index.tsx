import { createFileRoute } from '@tanstack/react-router'
import { AdminIntelligence } from '@/features/admin/components/admin-intelligence'
import { Skeleton } from '@/components/ui/skeleton'
import { RouteErrorFallback } from '@/routes/components/errors/route-error-fallback'

function AdminIntelligenceSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-3.5 w-36 rounded-md" />
      <div className="grid gap-4 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[300px] w-full rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-[300px] w-full rounded-2xl" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-2xl" />
    </div>
  )
}

export const Route = createFileRoute('/_authed/admin/intelligence/')({
  loader: async ({ context }) => {
    const { getMarketGapAnalysisServerFn } = await import('@/fn/admin')
    const { adminKeys } = await import('@/features/admin/hooks/use-admin')
    await context.queryClient.ensureQueryData({
      queryKey: adminKeys.marketGap(),
      queryFn: () => getMarketGapAnalysisServerFn(),
      staleTime: 5 * 60 * 1000,
    })
  },
  component: AdminIntelligence,
  pendingComponent: AdminIntelligenceSkeleton,
  errorComponent: RouteErrorFallback,
})
