'use client'

import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Users,
  Store,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  HelpCircle,
  UserPlus,
  BarChart3,
} from 'lucide-react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Cell,
  LabelList,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useAdminDashboardStats,
  useSystemMetrics,
  useMarketGapAnalysis,
} from '@/features/admin/hooks/use-analytics'
import { tCategory } from '@/utils/category-utils'
import { DirectionProvider } from '@/components/ui/direction'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type TimeRange = 7 | 30 | 90 | undefined

function RequestsVsQuotesChart({ data, dir }: { data: { date: string; requests: number; quotes: number }[]; dir: 'ltr' | 'rtl' }) {
  const { t } = useTranslation('dashboard/admin')
  const isEmpty = data.length === 0

  return (
    <DirectionProvider dir={dir}>
      <div className="h-[220px] sm:h-[300px] w-full">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('intelligence_page.no_data')}</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              requests: { label: t('charts.market_activity.requests'), color: '#3b82f6' },
              quotes: { label: t('charts.market_activity.quotes'), color: '#10b981' },
            }}
            className="h-full w-full [&_.recharts-legend-wrapper]:!overflow-x-auto [&_.recharts-legend-wrapper]:!flex"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ left: -16, right: 4, top: 8, bottom: dir === 'rtl' ? 20 : 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  className="text-[10px] font-medium text-slate-500"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tickLine={false} axisLine={false} className="text-[10px] font-medium text-slate-500" tick={{ fontSize: 10 }} width={35} />
                <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent payload={[] as any} />} />
                <Bar dataKey="requests" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={24} opacity={0.85} />
                <Line type="monotone" dataKey="quotes" stroke="#10b981" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </DirectionProvider>
  )
}

function CategorySupplyGapsChart({ data, dir }: { data: { category: string; demand: number; supplySellers: number; gap: number }[]; dir: 'ltr' | 'rtl' }) {
  const { t } = useTranslation('dashboard/admin')
  const displayData = useMemo(() => data.slice(0, 6), [data])
  const isEmpty = displayData.length === 0
  const maxVal = useMemo(() => {
    const m = Math.max(...displayData.map(d => Math.max(d.demand, d.supplySellers)), 1)
    return Math.ceil(m * 1.3)
  }, [displayData])
  const gapPalette = useMemo(() => {
    const gaps = displayData.map(d => d.gap)
    const maxGap = Math.max(...gaps, 1)
    return displayData.map(d => {
      const ratio = d.gap / maxGap
      if (ratio > 0.7) return '#ef4444'
      if (ratio > 0.4) return '#f59e0b'
      return '#3b82f6'
    })
  }, [displayData])

  return (
    <DirectionProvider dir={dir}>
      <div className="h-[220px] sm:h-[300px] w-full">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('intelligence_page.no_data')}</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              demand: { label: t('charts.supply_gaps.demand'), color: '#3b82f6' },
              supplySellers: { label: t('charts.supply_gaps.supply'), color: '#10b981' },
              gap: { label: t('charts.supply_gaps.gap'), color: '#ef4444' },
            }}
            className="h-full w-full [&_.recharts-legend-wrapper]:!overflow-x-auto [&_.recharts-legend-wrapper]:!flex"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} layout="vertical" margin={{ left: dir === 'rtl' ? 10 : 4, right: 24, top: 8, bottom: 0 }} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} className="text-[10px] font-medium text-slate-500" tick={{ fontSize: 10 }} domain={[0, maxVal]} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  className="text-[9px] sm:text-[10px] font-medium text-slate-500"
                  tick={{ fontSize: 9 }}
                  width={dir === 'rtl' ? 60 : 50}
                  tickFormatter={(val) => {
                    const translated = tCategory(val, t)
                    const maxLen = dir === 'rtl' ? 10 : 8
                    return translated.length > maxLen ? translated.slice(0, maxLen) + '…' : translated
                  }}
                />
                <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent payload={[] as any} />} />
                <Bar dataKey="demand" radius={[0, 3, 3, 0]} maxBarSize={16}>
                  {displayData.map((_, idx) => (
                    <Cell key={idx} fill={gapPalette[idx]} />
                  ))}
                  <LabelList dataKey="gap" position="right" className="text-[9px] sm:text-[10px] font-bold fill-muted-foreground" />
                </Bar>
                <Bar dataKey="supplySellers" fill="#10b981" radius={[0, 3, 3, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </DirectionProvider>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5 rounded-2xl transition-all', color)}>
      <div className="p-2 rounded-xl bg-background/40 shrink-0">
        <Icon className="size-5 sm:size-6" />
      </div>
      <div className="min-w-0">
        <p className="text-base sm:text-xl font-black tabular-nums leading-none text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground leading-tight mt-1 truncate">
          {label}
        </p>
      </div>
    </div>
  )
}

export function AdminOverview() {
  const { t, i18n } = useTranslation(['dashboard/admin', 'dashboard/layout'])
  const { data: user } = useAuth()
  const [days, setDays] = useState<TimeRange>(30)

  const { data: stats, isLoading: isStatsLoading } = useAdminDashboardStats(days)
  const { data: systemMetrics, isLoading: isMetricsLoading } = useSystemMetrics(days)
  const { data: gapAnalysis } = useMarketGapAnalysis()

  const isLoading = isStatsLoading || isMetricsLoading
  const dir = i18n.dir() as 'ltr' | 'rtl'

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: t('overview.time_filter.all'), value: undefined },
    { label: t('overview.time_filter.7d'), value: 7 },
    { label: t('overview.time_filter.30d'), value: 30 },
    { label: t('overview.time_filter.90d'), value: 90 },
  ]

  const chartData = useMemo(() => {
    const volumeMap = new Map<string, number>()
    const quoteMap = new Map<string, number>()

    for (const r of systemMetrics?.requestVolume || []) {
      volumeMap.set(r.date, r.count)
    }
    for (const q of systemMetrics?.quoteVolume || []) {
      quoteMap.set(q.date, q.count)
    }

    const allDates = new Set([...volumeMap.keys(), ...quoteMap.keys()])
    return Array.from(allDates).sort().map(date => ({
      date,
      requests: volumeMap.get(date) || 0,
      quotes: quoteMap.get(date) || 0,
    }))
  }, [systemMetrics?.requestVolume, systemMetrics?.quoteVolume])

  const totalBuyers = stats?.totalBuyers ?? 0
  const totalSellers = stats?.totalSellers ?? 0
  const openRequests = stats?.openRequests ?? 0
  const totalQuotes = stats?.totalQuotes ?? 0
  const avgOffers = stats?.avgOffersPerRequest ?? 0
  const isHealthy = (stats?.marketHealth ?? '').toLowerCase().includes('healthy')
  const registrations = stats?.totalUsers ?? 0
  const unservedCount = gapAnalysis?.unservedCount ?? 0
  const fulfillmentRate = gapAnalysis?.fulfillment?.rate ?? 0
  const gapCategoriesCount = (gapAnalysis?.categoryGaps || []).filter((c: any) => c.gap > 0).length

  if (isLoading && !stats) {
    return <AdminOverviewSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col gap-4 sm:gap-6 w-full pb-8 pt-2">
      <DirectionProvider dir={dir}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="size-9 sm:size-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-violet-500/20 shrink-0">
                {(user?.name || 'A').charAt(0)}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight text-foreground">
                  {t('welcome', { name: user?.name || 'Admin' })}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {isHealthy ? t('users.overview.thriving') : t('users.overview.needs_attention')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1" dir={dir}>
            {timeRanges.map((range) => (
              <button
                key={String(range.value)}
                onClick={() => setDays(range.value)}
                className={cn(
                  'shrink-0 h-7 sm:h-8 text-[10px] font-bold px-2.5 sm:px-3 rounded-lg border transition-colors',
                  days === range.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent',
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* All Stats — 8 cards, 4x2 grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard icon={Users} label={t('stats.buyers.label')} value={totalBuyers} color="text-blue-600 bg-blue-50 dark:bg-blue-950/30" />
          <StatCard icon={Store} label={t('stats.sellers.label')} value={totalSellers} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" />
          <StatCard icon={ClipboardList} label={t('stats.demands.label')} value={openRequests} color="text-amber-600 bg-amber-50 dark:bg-amber-950/30" />
          <StatCard icon={MessageSquare} label={t('stats.supply.label')} value={totalQuotes} color="text-violet-600 bg-violet-50 dark:bg-violet-950/30" />
          <StatCard icon={TrendingUp} label={t('users.overview.avg_offers')} value={avgOffers.toFixed(1)} color="text-sky-600 bg-sky-50 dark:bg-sky-950/30" />
          <StatCard icon={BarChart3} label={t('intelligence_page.metrics.fulfillment_rate')} value={`${fulfillmentRate}%`} color="text-teal-600 bg-teal-50 dark:bg-teal-950/30" />
          <StatCard icon={HelpCircle} label={t('intelligence_page.metrics.unserved')} value={unservedCount} color="text-rose-600 bg-rose-50 dark:bg-rose-950/30" />
          <StatCard icon={UserPlus} label={t('users.overview.recent_registrations')} value={registrations} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" />
        </div>

        {/* Market Gaps Summary — 3 cards, above charts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
              {t('intelligence_page.title')}
            </p>
            <Button asChild variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs font-bold gap-1">
              <Link to="/dashboard/admin/intelligence">
                {t('users.overview.view_analytics')} <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon={BarChart3} label={t('intelligence_page.metrics.fulfillment_rate')} value={`${fulfillmentRate}%`} color="text-teal-600 bg-teal-50 dark:bg-teal-950/30" />
            <StatCard icon={HelpCircle} label={t('intelligence_page.metrics.unserved')} value={unservedCount.toLocaleString()} color="text-rose-600 bg-rose-50 dark:bg-rose-950/30" />
            <StatCard icon={ClipboardList} label={t('intelligence_page.category_gaps')} value={gapCategoriesCount} color="text-amber-600 bg-amber-50 dark:bg-amber-950/30" />
          </div>
        </div>

        {/* Charts: side by side on lg, stacked on mobile */}
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl bg-card border border-border shadow-sm p-3 sm:p-5 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 sm:mb-3">
              {t('charts.market_activity.title')}
            </p>
            <RequestsVsQuotesChart data={chartData} dir={dir} />
          </div>
          <div className="lg:col-span-5 rounded-2xl bg-card border border-border shadow-sm p-3 sm:p-5 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 sm:mb-3">
              {t('charts.supply_gaps.title')}
            </p>
            <CategorySupplyGapsChart data={gapAnalysis?.categoryGaps || []} dir={dir} />
          </div>
        </div>
      </DirectionProvider>
    </div>
  )
}

function AdminOverviewSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 sm:gap-6 w-full pb-8 pt-2 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 sm:size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 sm:h-6 w-40 rounded-lg" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-7 sm:h-8 w-40 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="lg:col-span-7 h-[250px] sm:h-[300px] rounded-2xl" />
        <Skeleton className="lg:col-span-5 h-[250px] sm:h-[300px] rounded-2xl" />
      </div>

      <Skeleton className="h-3.5 w-28 rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}