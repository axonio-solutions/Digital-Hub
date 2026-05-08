import { Skeleton } from "@/components/ui/skeleton"

export function BuyerSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 w-full pb-8">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-3.5 w-72 rounded-md" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-9 w-[120px] rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between py-2 border-b border-border/60 mb-4">
          <Skeleton className="h-8 w-[200px] rounded-lg" />
          <Skeleton className="h-8 w-[80px] rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl opacity-50" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 items-center h-14 border-b border-border/40 pb-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md ms-auto" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full ms-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
