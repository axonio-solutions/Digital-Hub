import { createFileRoute, redirect } from '@tanstack/react-router'
import { TaxonomyHub } from '@/features/taxonomy/components/taxonomy-hub'
import { taxonomyKeys } from '@/features/taxonomy/hooks/use-taxonomy'
import { Skeleton } from '@/components/ui/skeleton'
import { RouteErrorFallback } from '@/routes/components/errors/route-error-fallback'

function TaxonomySkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-[500px] w-full rounded-2xl" />
    </div>
  )
}

export const Route = createFileRoute('/_authed/dashboard/admin/categories')({
  beforeLoad: ({ context }: any) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ context }) => {
    const { getTaxonomyServerFn } = await import('@/fn/admin')
    await context.queryClient.ensureQueryData({
      queryKey: taxonomyKeys.all,
      queryFn: async () => {
        const res = (await getTaxonomyServerFn()) as any
        if (!res.success) throw new Error(res.error)
        return res.data
      },
      staleTime: 10 * 60 * 1000,
    })
  },
  component: TaxonomyHub,
  pendingComponent: TaxonomySkeleton,
  errorComponent: RouteErrorFallback,
})
