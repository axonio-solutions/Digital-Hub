import { Skeleton } from "@/components/ui/skeleton"

export function BuyerSkeleton() {
  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="layout-container flex justify-center w-full py-2 px-2 sm:px-4 lg:px-6">
        <div className="flex w-full max-w-6xl flex-col gap-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-4 w-96 rounded-md" />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 backdrop-blur-xl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Toolbar skeleton */}
              <div className="flex items-center justify-between space-x-2 py-4 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-[250px] rounded-lg" />
                  <Skeleton className="h-8 w-[100px] rounded-[1rem] border-dashed" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-[100px] rounded-lg" />
                </div>
              </div>

              {/* Table skeleton */}
              <div className="space-y-4 pt-4 mt-2">
                <Skeleton className="h-12 w-full rounded-xl opacity-50" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 items-center h-16 w-full border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <Skeleton className="h-5 w-48 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-md ms-auto" />
                    <Skeleton className="h-5 w-24 rounded-md mx-6" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-full ms-6 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

