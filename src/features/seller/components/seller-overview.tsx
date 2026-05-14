'use client'

import React, { memo, useMemo } from 'react'
import { Await, Link, getRouteApi } from '@tanstack/react-router'
import { ArrowRight, BarChart3, ShoppingBag, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format, isSameDay, startOfDay, subDays } from 'date-fns'
import { ar, enUS, fr } from 'date-fns/locale'
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const routeApi = getRouteApi('/_authed/dashboard/')

interface DashboardData {
  stats: { won: number; pending: number; winRate: number; totalRevenue: number; totalQuotes: number }
  todayStats: { won: number; pending: number; revenue: number }
  recentSales: Array<{ id: string; price: number; updatedAt: string | Date; status: string; request?: { partName?: string } | null }>
  chartQuotes: Array<{ price: number; updatedAt: string | Date }>
}

// --- Weekly Chart ---

const WeeklyChart = memo(({ chartData, language, t, isRtl }: { chartData: Array<{ name: string; accepted: number; revenue: number }>; language: string; t: any; isRtl?: boolean }) => {
  const hasValues = chartData.some((d) => d.accepted > 0)

  if (chartData.length === 0 || !hasValues) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <BarChart3 className="size-8 text-muted-foreground/15 mb-3" />
        <p className="text-xs font-bold text-muted-foreground">{t('charts.no_data', 'No data')}</p>
      </div>
    )
  }

  const countAxisSide = isRtl ? 'right' : 'left'
  const revenueAxisSide = isRtl ? 'left' : 'right'
  const countDx = isRtl ? 4 : -4
  const revenueDx = isRtl ? -4 : 4

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
          dy={6}
          reversed={isRtl}
        />
        <YAxis
          yAxisId="count"
          orientation={countAxisSide}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
          dx={countDx}
          allowDecimals={false}
          domain={[0, 'auto']}
        />
        <YAxis
          yAxisId="revenue"
          orientation={revenueAxisSide}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
          dx={revenueDx}
          tickFormatter={(v) => v > 0 ? `${(v / 1000).toFixed(0)}k` : '0'}
          domain={[0, 'auto']}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl text-sm">
                {payload.map((entry: any) => (
                  <p key={entry.name} className="text-xs font-bold tabular-nums" style={{ color: entry.color }}>
                    {entry.name === 'accepted' ? `${entry.value} ${t('overview.accepted_count', 'accepted')}` : `${entry.value?.toLocaleString(language)} DZD`}
                  </p>
                ))}
              </div>
            )
          }}
        />
        <Bar yAxisId="count" dataKey="accepted" fill="var(--primary)" radius={[3, 3, 0, 0]} barSize={24} />
        <Line yAxisId="revenue" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} animationDuration={400} />
      </ComposedChart>
    </ResponsiveContainer>
  )
})

// --- Quick Link ---

const QuickLink = memo(({ to, icon: Icon, title, desc }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) => (
  <Link
    to={to}
    className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted transition-all duration-200"
  >
    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
      <Icon className="size-5 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-black tracking-tight">{title}</p>
      <p className="text-[11px] text-muted-foreground font-bold mt-0.5">{desc}</p>
    </div>
    <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all shrink-0" />
  </Link>
))

// --- Main Content ---

function StatsSection({ dashboardData, t, language, isRtl }: { dashboardData: DashboardData; t: any; language: string; isRtl?: boolean }) {
  const { stats, todayStats, chartQuotes } = dashboardData
  const today = new Date()
  const dateLocale = useMemo(() => {
    const map: Record<string, any> = { en: enUS, fr, ar }
    return map[language] || enUS
  }, [language])

  const chartData = useMemo(() => {
    if (chartQuotes.length === 0) return []
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      const dayQuotes = chartQuotes.filter((q) =>
        isSameDay(startOfDay(new Date(q.updatedAt)), startOfDay(date))
      )
      return {
        name: format(date, 'EEE', { locale: dateLocale }),
        accepted: dayQuotes.length,
        revenue: dayQuotes.reduce((sum, q) => sum + q.price, 0),
      }
    })
  }, [chartQuotes, today, dateLocale])

  const metrics = [
    { label: t('stats.won.label'), value: stats.won, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' },
    { label: t('stats.active.label'), value: stats.pending, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50' },
    { label: t('stats.win_rate.label'), value: `${stats.winRate.toFixed(1)}%`, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/50' },
    { label: t('stats.earnings.label'), value: `${stats.totalRevenue.toLocaleString(language)} DZD`, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={cn('flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all', m.color)}>
            <span className="text-xl font-black tabular-nums leading-none">{typeof m.value === 'number' ? m.value : m.value}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Today's Sales + Weekly Chart */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Today's Sales Card - 1/3 */}
        <Card className="overflow-hidden md:col-span-1">
          <CardContent className="p-5 flex flex-col h-full gap-3">
            <div>
              <h3 className="text-sm font-black tracking-tight">{t('overview.today_sales', "Today's Sales")}</h3>
              <p className="text-[10px] text-muted-foreground font-bold">{format(today, 'M/d/yy')}</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-7xl sm:text-8xl font-black text-foreground tabular-nums leading-none tracking-tighter">
                {todayStats.won}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{t('overview.accepted_today', 'Accepted Today')}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
              <div className="text-center">
                <p className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">{todayStats.won}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{t('overview.accepted_today', 'Accepted')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black tabular-nums text-red-500 dark:text-red-400">{todayStats.pending}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{t('overview.rejected_today', 'Pending')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black tabular-nums text-foreground">{todayStats.revenue.toLocaleString(language)}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">DZD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Chart - 2/3 */}
        <Card className="overflow-hidden md:col-span-2">
          <CardContent className="p-5">
            <div className="mb-3">
              <h3 className="text-sm font-black tracking-tight">{t('overview.weekly_title', 'Last 7 Days')}</h3>
            </div>
            <div className="h-[260px] sm:h-[300px]">
              <WeeklyChart chartData={chartData} language={language} t={t} isRtl={isRtl} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink to="/dashboard/quotes" icon={BarChart3} title={t('actions.view_quotes')} desc={t('actions.view_quotes_desc', { count: stats.totalQuotes })} />
        <QuickLink to="/explore" icon={ShoppingBag} title={t('actions.browse_requests')} desc={t('actions.browse_requests_desc')} />
      </div>
    </div>
  )
}

// --- Main Component ---

export function SellerOverview() {
  const { t, i18n } = useTranslation(['dashboard/seller', 'dashboard/layout'])
  const { data: user } = useAuth()
  const isRtl = i18n.dir() === 'rtl'

  const { statsPromise } = routeApi.useLoaderData()

  return (
    <div className="flex-1 flex flex-col gap-4 w-full pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
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
              <p className="text-xs text-muted-foreground font-medium">{t('actions.explore_subtitle')}</p>
            </div>
          </div>
        </div>

        <Button asChild className="font-black uppercase text-xs tracking-widest h-11 px-6 shadow-lg shadow-primary/20 rounded-2xl w-full sm:w-auto">
          <Link to="/explore">
            <Sparkles className="size-4 me-2" />
            {t('actions.explore_cta')}
          </Link>
        </Button>
      </div>

      {/* Content */}
      <React.Suspense fallback={<OverviewSkeleton />}>
        <Await promise={statsPromise!}>
          {(dashboardData) => <StatsSection dashboardData={dashboardData} t={t} language={i18n.language} isRtl={isRtl} />}
        </Await>
      </React.Suspense>
    </div>
  )
}

// --- Skeleton ---

function OverviewSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 w-full animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="md:col-span-1 h-[280px] rounded-2xl" />
        <Skeleton className="md:col-span-2 h-[280px] rounded-2xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-[84px] rounded-2xl" />
        <Skeleton className="h-[84px] rounded-2xl" />
      </div>
    </div>
  )
}
