'use client'

import { useMemo, useState } from 'react'
import {
  Store,
  TrendingUp,
  Timer,
  Users,
  BarChart3,
} from 'lucide-react'
import { AlgeriaMap } from './algeria-map'
import { useSellerAnalytics } from '@/features/admin/hooks/use-analytics'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function SellerAnalytics() {
  const { t } = useTranslation('dashboard/admin')
  const { data: analytics, isLoading } = useSellerAnalytics()

  const categoryDistribution = useMemo(() => {
    return [...(analytics?.demandByCategory || [])].sort((a: any, b: any) => b.count - a.count).slice(0, 5)
  }, [analytics?.demandByCategory])

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const activeData = useMemo(() => {
    if (activeIndex === null || !analytics?.requestVolume) return null
    return analytics.requestVolume[activeIndex]
  }, [activeIndex, analytics?.requestVolume])

  const totalSellers = analytics?.distribution?.reduce((a: number, b: any) => a + b.count, 0) || 0

  if (isLoading && !analytics) {
    return <SellerAnalyticsSkeleton />
  }

  const metrics = [
    {
      label: t('metrics.quotes_frequency'),
      value: analytics?.metrics?.avgQuotesPerRequest || '0',
      icon: BarChart3,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: t('metrics.win_rate'),
      value: analytics?.metrics?.conversionRate || '0%',
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: t('metrics.turnaround'),
      value: analytics?.metrics?.avgResponseTime || '0m',
      icon: Timer,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: t('metrics.merchant_base'),
      value: totalSellers.toLocaleString(),
      icon: Users,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
    },
  ]

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-emerald-500/20 shrink-0">
            <Store className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {t('intelligence.seller')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {t('subtitle.seller')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
            {totalSellers} {t('metrics.supply_nodes')}
          </span>
        </div>
      </div>

      {/* Compact Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn('flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all', m.color)}
          >
            <div className="flex items-center gap-1.5">
              <m.icon className="size-4" />
              <span className="text-xl font-black tabular-nums leading-none">{m.value}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          {t('charts.quote_velocity')}
        </p>

        <div className="grid gap-4 lg:grid-cols-7">
          {/* Quote Volume Bar Chart */}
          <div className="lg:col-span-4 rounded-2xl bg-card border border-border shadow-sm p-5">
            <div className="flex h-[200px] items-end gap-2 px-2">
              {(analytics?.requestVolume || []).length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">No data yet</p>
                </div>
              ) : (
                <ChartContainer
                  config={{ count: { label: 'Quotes', color: '#10b981' } }}
                  className="h-full w-full"
                >
                  <BarChart
                    data={analytics?.requestVolume || []}
                    onMouseLeave={() => setActiveIndex(null)}
                    margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
                  >
                    <XAxis dataKey="date" tickLine={false} tickMargin={8} axisLine={false}
                      className="text-[9px] font-medium text-slate-400"
                      tickFormatter={(v: string) => v?.slice(-2) || ''}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#10b981">
                      {(analytics?.requestVolume || []).map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fillOpacity={activeIndex === null ? 0.8 : activeIndex === index ? 1 : 0.2}
                          onMouseEnter={() => setActiveIndex(index)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </div>
            {activeData && (
              <p className="text-center mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {activeData.date}: {activeData.count} quotes
              </p>
            )}
          </div>

          {/* Category Focus Summary */}
          <div className="lg:col-span-3 rounded-2xl bg-card border border-border shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
              {t('charts.category_focus')}
            </p>
            <div className="space-y-3">
              {categoryDistribution.map((item: any, i: number) => {
                const total = categoryDistribution.reduce((s: number, d: any) => s + d.count, 0) || 1
                const pct = ((item.count / total) * 100).toFixed(0)
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{item.label}</span>
                      </div>
                      <span className="font-black tabular-nums text-slate-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-5 sm:p-8 overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-0.5">
            <h3 className="font-black text-lg text-foreground uppercase leading-tight">
              {t('distribution.seller_title')}
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {t('distribution.regional_concentration')}
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-center bg-slate-50/5 dark:bg-slate-900/5 rounded-3xl overflow-hidden min-h-[350px] sm:min-h-[450px] lg:min-h-[500px]">
          <AlgeriaMap data={analytics?.distribution || []} role="seller" className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}

function SellerAnalyticsSkeleton() {
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
        <Skeleton className="h-9 w-44 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-3.5 w-36 rounded-md" />
      <div className="grid gap-4 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[240px] w-full rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-[240px] w-full rounded-2xl" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  )
}
