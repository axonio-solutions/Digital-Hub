import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { RevenueMetrics } from '@/features/credits/components/revenue-metrics'

export function RevenueRoute() {
  const { t } = useTranslation('dashboard/credits')

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-emerald-500/20 shrink-0">
          R
        </div>
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {t('revenue.title')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {t('revenue.subtitle')}
          </p>
        </div>
      </div>
      <RevenueMetrics />
    </div>
  )
}

export function RevenueSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-2xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] w-full rounded-2xl" />
    </div>
  )
}
