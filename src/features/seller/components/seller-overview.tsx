'use client'

import React, { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Coins,
  ShoppingBag,
  Sparkles,
  Trophy,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format, isSameDay, startOfDay, subDays } from 'date-fns'
import { ar, enUS, fr } from 'date-fns/locale'
import {
  Bar,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useSellerCreditBalance } from '@/features/seller/hooks/use-billing'
import { useSellerDashboardStats } from '@/features/marketplace/hooks/use-marketplace'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardData {
  stats: {
    won: number
    pending: number
    winRate: number
    totalRevenue: number
    totalQuotes: number
  }
  todayStats: { won: number; pending: number; lost: number; revenue: number }
  recentSales: Array<{
    id: string
    price: number
    updatedAt: string | Date
    status: string
    request?: { partName?: string } | null
  }>
  chartQuotes: Array<{ price: number; updatedAt: string | Date }>
}

// --- Weekly Chart ---

const WeeklyChart = memo(
  ({
    chartData,
    language,
    t,
    isRtl,
    todayIndex,
  }: {
    chartData: Array<{ name: string; accepted: number; revenue: number }>
    language: string
    t: any
    isRtl?: boolean
    todayIndex: number
  }) => {
    const hasValues = chartData.some((d) => d.accepted > 0)

    const config: ChartConfig = {
      accepted: {
        label: t('overview.legend_accepted', 'Accepted'),
        color: 'var(--primary)',
      },
      revenue: {
        label: t('overview.legend_revenue', 'Revenue'),
        color: '#10b981',
      },
    }

    if (chartData.length === 0 || !hasValues) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center">
          <BarChart3 className="size-8 text-muted-foreground/15 mb-3" />
          <p className="text-xs font-bold text-muted-foreground">
            {t('charts.no_data', 'No data')}
          </p>
        </div>
      )
    }

    const countAxisSide = isRtl ? 'right' : 'left'
    const countDx = isRtl ? 4 : -4

    return (
      <ChartContainer config={config} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <ComposedChart
            data={chartData}
            margin={{ top: 24, right: 16, left: 4, bottom: 8 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              reversed={isRtl}
              tick={({ x, y, payload, index }: any) => (
                <g transform={`translate(${x},${y})`}>
                  <text
                    dy={6}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill="#94a3b8"
                  >
                    {payload.value}
                  </text>
                  {index === todayIndex && (
                    <circle cx={0} cy={18} r={3} fill="#10b981" />
                  )}
                </g>
              )}
            />
            {/* Count axis — visible, drives bar height */}
            <YAxis
              yAxisId="count"
              orientation={countAxisSide}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              dx={countDx}
              allowDecimals={false}
              domain={[0, 'auto']}
              width={20}
              tickCount={3}
            />
            {/* Revenue axis — hidden, gives line its own independent scale */}
            <YAxis yAxisId="revenue" hide domain={[0, 'auto']} />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    name === 'revenue'
                      ? `${Number(value).toLocaleString(language)} DZD`
                      : value
                  }
                />
              }
            />
            <Bar
              yAxisId="count"
              dataKey="accepted"
              radius={[4, 4, 0, 0]}
              barSize={24}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === todayIndex
                      ? 'hsl(var(--muted-foreground) / 0.18)'
                      : 'var(--color-accepted)'
                  }
                  stroke={
                    i === todayIndex
                      ? 'hsl(var(--muted-foreground) / 0.35)'
                      : undefined
                  }
                  strokeDasharray={i === todayIndex ? '3 3' : undefined}
                />
              ))}
              <LabelList
                dataKey="accepted"
                position="top"
                formatter={(v: any) => (v > 0 ? v : '')}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: 'hsl(var(--foreground))',
                }}
              />
            </Bar>
            <Line
              yAxisId="revenue"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              animationDuration={400}
            >
              <LabelList
                dataKey="revenue"
                position="top"
                formatter={(v: any) =>
                  v > 0 ? `${(v / 1000).toFixed(1)}k` : ''
                }
                style={{ fontSize: 9, fontWeight: 600, fill: '#10b981' }}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  },
)

// --- Quick Link ---

const QuickLink = memo(
  ({
    to,
    icon: Icon,
    title,
    desc,
  }: {
    to: string
    icon: React.ComponentType<{ className?: string }>
    title: string
    desc: string
  }) => (
    <Link
      to={to}
      className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted transition-all duration-200"
    >
      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black tracking-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground font-bold mt-0.5">
          {desc}
        </p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all shrink-0" />
    </Link>
  ),
)

// --- Stats Cards ---

function StatsCards({
  stats,
  creditData,
  t,
  language,
  className,
}: {
  stats: DashboardData['stats']
  creditData?: { balance?: number } | null
  t: any
  language: string
  className?: string
}) {
  const credits = creditData?.balance ?? 0

  const fmtRevenue = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
    return v.toLocaleString(language)
  }

  const metrics = [
    {
      label: t('stats.won.label'),
      sub: t('stats.won.sub'),
      value: stats.won,
      icon: Trophy,
      badge: `${stats.winRate.toFixed(1)}%`,
      badgeLabel: t('stats.win_rate.label'),
      badgeColor: 'text-orange-500',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      border: 'border-emerald-200/50 dark:border-emerald-800/30',
    },
    {
      label: t('stats.active.label'),
      sub: t('stats.active.sub'),
      value: stats.pending,
      icon: Activity,
      badge: null as null | string,
      badgeLabel: '',
      badgeColor: '',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      border: 'border-blue-200/50 dark:border-blue-800/30',
    },
    {
      label: t('stats.earnings.label'),
      sub: t('stats.earnings.sub'),
      value: `${fmtRevenue(stats.totalRevenue)} DZD`,
      icon: Coins,
      badge: null as null | string,
      badgeLabel: '',
      badgeColor: '',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      border: 'border-purple-200/50 dark:border-purple-800/30',
    },
    {
      label: t('billing.current_balance'),
      sub: t('billing.credits_available'),
      value: credits,
      icon: Wallet,
      badge: null as null | string,
      badgeLabel: '',
      badgeColor: '',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      border: 'border-amber-200/50 dark:border-amber-800/30',
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {metrics.map((m) => (
        <div
          key={m.label}
          className={cn(
            'flex items-center gap-2.5 px-3 py-3 rounded-2xl border transition-all',
            m.bg,
            m.border,
          )}
        >
          <div
            className={cn(
              'size-8 rounded-xl flex items-center justify-center shrink-0',
              m.iconBg,
            )}
          >
            <m.icon className={cn('size-4', m.color)} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-base sm:text-xl font-black tabular-nums leading-none truncate">
              {m.value}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-foreground/70 leading-tight truncate">
              {m.label}
            </span>
            <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground leading-tight">
              {m.sub}
            </span>
          </div>
          {m.badge && (
            <div className="text-end shrink-0 ps-1">
              <span
                className={cn(
                  'text-sm sm:text-base font-black tabular-nums leading-none',
                  m.badgeColor,
                )}
              >
                {m.badge}
              </span>
              <span className="text-[8px] font-bold text-muted-foreground block uppercase tracking-wider leading-tight">
                {m.badgeLabel}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// --- Main Content ---

function StatsSection({
  dashboardData,
  t,
  language,
  isRtl,
}: {
  dashboardData: DashboardData
  t: any
  language: string
  isRtl?: boolean
}) {
  const { stats, todayStats, chartQuotes } = dashboardData
  const { data: creditData } = useSellerCreditBalance()
  const today = useMemo(() => startOfDay(new Date()), [])
  const dateLocale = useMemo(() => {
    const map: Record<string, any> = { en: enUS, fr, ar }
    return map[language] || enUS
  }, [language])

  const chartData = useMemo(() => {
    if (chartQuotes.length === 0) return []
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      const dayQuotes = chartQuotes.filter((q) =>
        isSameDay(startOfDay(new Date(q.updatedAt)), startOfDay(date)),
      )
      return {
        name: format(date, 'EEE', { locale: dateLocale }),
        accepted: dayQuotes.length,
        revenue: dayQuotes.reduce((sum, q) => sum + q.price, 0),
      }
    })
  }, [chartQuotes, today, dateLocale])

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop Stats — hidden on mobile (shown above explore button) */}
      <StatsCards
        stats={stats}
        creditData={creditData}
        t={t}
        language={language}
        className="hidden sm:grid"
      />

      {/* Today's Sales + Weekly Chart */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Today's Sales Card - 1/3 */}
        <Card className="overflow-hidden md:col-span-1">
          <CardContent className="p-5 flex flex-col h-full gap-3">
            <div>
              <h3 className="text-sm font-black tracking-tight">
                {t('overview.today_sales', "Today's Sales")}
              </h3>
              <p className="text-[10px] text-muted-foreground font-bold">
                {format(today, 'P', { locale: dateLocale })}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-7xl sm:text-8xl font-black text-foreground tabular-nums leading-none tracking-tighter">
                {todayStats.won}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
                {t('overview.accepted_today', 'Accepted Today')}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-1 pt-3 border-t border-border">
              <div className="text-center">
                <p className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                  {todayStats.won}
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t('overview.accepted_today', 'Accepted')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black tabular-nums text-blue-600 dark:text-blue-400">
                  {todayStats.pending}
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t('overview.pending_today', 'Pending')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black tabular-nums text-red-500 dark:text-red-400">
                  {todayStats.lost}
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t('overview.rejected_today', 'Rejected')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black tabular-nums text-foreground">
                  {todayStats.revenue.toLocaleString(language)}
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  DZD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Chart - 2/3 */}
        <Card className="overflow-hidden md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-black tracking-tight flex-1">
                {t('overview.weekly_title', 'Last 7 Days')}
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
                {t('overview.legend_accepted', 'Accepted')}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                <span className="w-4 h-[2.5px] bg-emerald-500 inline-block rounded-full" />
                {t('overview.legend_revenue', 'Revenue')}
              </span>
            </div>
            <div className="h-[260px] sm:h-[300px]">
              <WeeklyChart
                chartData={chartData}
                language={language}
                t={t}
                isRtl={isRtl}
                todayIndex={chartData.length - 1}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          to="/dashboard/quotes"
          icon={BarChart3}
          title={t('actions.view_quotes')}
          desc={t('actions.view_quotes_desc', { count: stats.totalQuotes })}
        />
        <QuickLink
          to="/explore"
          icon={ShoppingBag}
          title={t('actions.browse_requests')}
          desc={t('actions.browse_requests_desc')}
        />
        <QuickLink
          to="/dashboard/billing"
          icon={Coins}
          title={t('billing.title')}
          desc={t('billing.credits_available')}
        />
      </div>
    </div>
  )
}

// --- Main Component ---

export function SellerOverview() {
  const { t, i18n } = useTranslation([
    'dashboard/seller',
    'dashboard/layout',
    'dashboard/credits',
  ])
  const { data: user } = useAuth()
  const isRtl = i18n.dir() === 'rtl'

  const { data: dashboardData, isLoading } = useSellerDashboardStats(
    user?.id || '',
  )
  const { data: creditData } = useSellerCreditBalance()
  const language = i18n.language

  return (
    <div
      className="flex-1 flex flex-col gap-4 w-full pb-8"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Title + Explore row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-sm uppercase shadow-lg shadow-primary/20 shrink-0">
              {(user?.name || 'S').charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {t('welcome', { name: user?.name || 'Seller' })}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {t('actions.explore_subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Stats — between title and explore button */}
        {!isLoading && dashboardData && (
          <div className="block sm:hidden">
            <StatsCards
              stats={dashboardData.stats}
              creditData={creditData}
              t={t}
              language={language}
            />
          </div>
        )}

        <Button
          asChild
          className="font-black uppercase text-xs tracking-widest h-11 px-6 shadow-lg shadow-primary/20 rounded-2xl w-full sm:w-auto"
        >
          <Link to="/explore">
            <Sparkles className="size-4 me-2" />
            {t('actions.explore_cta')}
          </Link>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <OverviewSkeleton />
      ) : dashboardData ? (
        <StatsSection
          dashboardData={dashboardData}
          t={t}
          language={language}
          isRtl={isRtl}
        />
      ) : null}
    </div>
  )
}

// --- Skeleton ---

function OverviewSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 w-full animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="md:col-span-1 h-[280px] rounded-2xl" />
        <Skeleton className="md:col-span-2 h-[280px] rounded-2xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-[84px] rounded-2xl" />
        <Skeleton className="h-[84px] rounded-2xl" />
        <Skeleton className="h-[84px] rounded-2xl" />
      </div>
    </div>
  )
}
