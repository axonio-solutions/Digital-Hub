'use client'

import { useMemo } from 'react'
import {
  BarChart3,
  ClipboardList,
  HelpCircle,
  RefreshCw,
  Store,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DirectionProvider } from '@/components/ui/direction'
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from '@/components/ui/stat'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useMarketGapAnalysis } from '@/features/admin/hooks/use-analytics'
import { tCategory } from '@/utils/category-utils'
import { WILAYAS } from '@/lib/constants/wilayas'

function GapComparisonChart({
  data,
  nameKey,
  t,
  translateName,
  dir,
}: {
  data: Array<any>
  nameKey: string
  t: (key: string) => string
  translateName: (value: string) => string
  dir?: string
}) {
  const chartData = useMemo(
    () =>
      data.slice(0, 8).map((item) => ({
        name: translateName(item[nameKey]),
        Demand: item.demand,
        Supply: item.supplySellers,
        Gap: item.gap,
      })),
    [data, nameKey],
  )

  return (
    <div className="h-[300px] w-full">
      {chartData.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('intelligence_page.no_data')}
          </p>
        </div>
      ) : (
        <ChartContainer
          config={{
            Demand: { label: t('intelligence_page.demand'), color: '#3b82f6' },
            Supply: { label: t('intelligence_page.supply'), color: '#10b981' },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barGap={2}
              barCategoryGap="20%"
              margin={{
                left: -10,
                right: 8,
                top: 8,
                bottom: dir === 'rtl' ? 16 : 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200 dark:stroke-slate-800"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                className="text-[10px] font-medium text-slate-500"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={dir === 'rtl' ? 80 : 60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-[10px] font-medium text-slate-500"
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={<ChartTooltipContent />}
              />
              <ChartLegend
                content={<ChartLegendContent payload={[] as any} />}
              />
              <Bar
                dataKey="Demand"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="Supply"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}

function UnservedBadge({ gap }: { gap: number }) {
  if (gap <= 0)
    return (
      <Badge variant="secondary" className="text-[10px] font-bold">
        0
      </Badge>
    )
  if (gap <= 2)
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-bold border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
      >
        {gap}
      </Badge>
    )
  return (
    <Badge variant="destructive" className="text-[10px] font-bold">
      {gap}
    </Badge>
  )
}

function GapSummaryTable({
  data,
  nameKey,
  t,
  translateName,
}: {
  data: Array<any>
  nameKey: string
  t: (key: string) => string
  translateName: (value: string) => string
}) {
  const maxDemand = Math.max(...data.map((d) => d.demand || 0), 1)

  return (
    <div className="space-y-1">
      {data.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('intelligence_page.no_data')}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.slice(0, 8).map((item) => (
            <div
              key={item[nameKey]}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                  {translateName(item[nameKey])}
                </p>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(item.demand / maxDemand) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 tabular-nums shrink-0">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 w-6 text-right">
                  {item.demand}
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 w-6 text-right">
                  {item.supplySellers}
                </span>
                <UnservedBadge gap={item.gap} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-end gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <div className="size-2 rounded bg-blue-500" />
          {t('intelligence_page.demand')}
        </span>
        <span className="flex items-center gap-1">
          <div className="size-2 rounded bg-emerald-500" />
          {t('intelligence_page.supply')}
        </span>
        <span className="flex items-center gap-1">
          <div className="size-2 rounded bg-amber-500" />
          {t('intelligence_page.gap')}
        </span>
      </div>
    </div>
  )
}

function SectionError({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <HelpCircle className="size-8 text-muted-foreground/50" />
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center max-w-xs">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="size-3" />
          Retry
        </Button>
      )}
    </div>
  )
}

export function AdminIntelligence() {
  const { t, i18n } = useTranslation('dashboard/admin')
  const { t: tw } = useTranslation('wilayas')
  const { data: analysis, isLoading, isError, refetch } = useMarketGapAnalysis()

  const translateName = useMemo(
    () => (nameKey: string, value: string) => {
      if (nameKey === 'wilaya') {
        const id = WILAYAS.find((w) => w.name === value)?.id
        return id ? tw(id) : value
      }
      if (nameKey === 'category') {
        return tCategory(value, t)
      }
      return value
    },
    [t, tw],
  )

  const totalDemand = useMemo(
    () =>
      (analysis?.categoryGaps || []).reduce(
        (s: number, c: any) => s + c.demand,
        0,
      ),
    [analysis?.categoryGaps],
  )

  if (isLoading && !analysis) {
    return <AdminIntelligenceSkeleton />
  }

  if (isError && !analysis) {
    return (
      <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
        <SectionError
          message={t('intelligence_page.no_data')}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const metrics = [
    {
      label: t('intelligence_page.metrics.open_demand'),
      value: totalDemand.toLocaleString(),
      icon: ClipboardList,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: t('intelligence_page.metrics.active_sellers'),
      value: (analysis?.fulfillment?.total || 0).toLocaleString(),
      icon: Store,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: t('intelligence_page.metrics.unserved'),
      value: (analysis?.unservedCount || 0).toLocaleString(),
      icon: HelpCircle,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: t('intelligence_page.metrics.fulfillment_rate'),
      value: `${analysis?.fulfillment?.rate || 0}%`,
      icon: TrendingUp,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
    },
  ]

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-amber-500/20 shrink-0">
            <BarChart3 className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-foreground">
              {t('intelligence_page.title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {t('intelligence_page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <>
        {/* Mobile */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all',
                m.color,
              )}
            >
              <div className="flex items-center gap-1.5">
                <m.icon className="size-4" />
                <span className="text-xl font-black tabular-nums leading-none text-foreground">
                  {m.value}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">
                {m.label}
              </span>
            </div>
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden sm:grid grid-cols-4 gap-3">
          {metrics.map((m) => (
            <Stat key={m.label}>
              <StatLabel>{m.label}</StatLabel>
              <StatIndicator
                variant="icon"
                color={
                  m.color.includes('blue')
                    ? 'info'
                    : m.color.includes('emerald')
                      ? 'success'
                      : m.color.includes('amber')
                        ? 'warning'
                        : 'default'
                }
              >
                <m.icon />
              </StatIndicator>
              <StatValue>{m.value}</StatValue>
            </Stat>
          ))}
        </div>
      </>

      {/* Tabs: Bar Chart view / Summary Table view */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <DirectionProvider dir={i18n.dir()}>
          <Tabs defaultValue="chart" className="w-full">
            <div className="flex items-center justify-between px-5 pt-4 pb-0">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                {t('intelligence_page.category_gaps')}
              </p>
              <TabsList className="h-8">
                <TabsTrigger
                  value="chart"
                  className="text-[10px] font-bold px-3"
                >
                  {t('intelligence_page.chart_view')}
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="text-[10px] font-bold px-3"
                >
                  {t('intelligence_page.table_view')}
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="p-5 pt-3">
              <TabsContent value="chart" className="m-0">
                <GapComparisonChart
                  data={analysis?.categoryGaps || []}
                  nameKey="category"
                  t={t}
                  translateName={(v) => translateName('category', v)}
                  dir={i18n.dir()}
                />
              </TabsContent>
              <TabsContent value="table" className="m-0">
                <GapSummaryTable
                  data={analysis?.categoryGaps || []}
                  nameKey="category"
                  t={t}
                  translateName={(v) => translateName('category', v)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DirectionProvider>
      </Card>

      {/* Brand Gaps + Regional Gaps */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border shadow-sm p-5">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-3">
            {t('intelligence_page.brand_gaps')}
          </p>
          <GapSummaryTable
            data={analysis?.brandGaps || []}
            nameKey="brand"
            t={t}
            translateName={(v) => translateName('brand', v)}
          />
        </Card>
        <Card className="rounded-2xl border-border shadow-sm p-5">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-3">
            {t('intelligence_page.regional_gaps')}
          </p>
          <GapSummaryTable
            data={analysis?.regionalGaps || []}
            nameKey="wilaya"
            t={t}
            translateName={(v) => translateName('wilaya', v)}
          />
        </Card>
      </div>
    </div>
  )
}

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
      <Skeleton className="h-[360px] w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    </div>
  )
}
