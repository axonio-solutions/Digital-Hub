'use client'

import { Skeleton } from "@/components/ui/skeleton"

export function BuyerSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-3.5 w-56 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-xl shrink-0" />
          <Skeleton className="h-11 w-32 sm:w-40 rounded-2xl" />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-36 rounded-md" />
        <Skeleton className="h-9 w-[120px] rounded-xl" />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden flex-1 min-h-[400px]">
        <div className="flex items-center justify-between py-2 border-b border-border/60 mb-3">
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
