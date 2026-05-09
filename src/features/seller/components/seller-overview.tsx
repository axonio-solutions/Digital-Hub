'use client'

import React, { memo, useMemo } from 'react'
import { Await, Link, getRouteApi } from '@tanstack/react-router'
import { ArrowRight, BarChart3, CheckCircle2, MessageSquare, ShoppingBag, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format, isSameDay, startOfDay, subDays } from 'date-fns'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const routeApi = getRouteApi('/_authed/dashboard/')

// --- Types ---

interface DashboardData {
  stats: { won: number; pending: number; winRate: number; totalRevenue: number; totalQuotes: number }
  todayStats: { won: number; pending: number; revenue: number }
  recentSales: Array<{ id: string; price: number; updatedAt: string | Date; status: string; request?: { partName?: string } | null }>
  chartQuotes: Array<{ price: number; updatedAt: string | Date }>
}

// --- Revenue Chart ---

const RevenueChart = memo(({ chartData, language }: { chartData: Array<{ name: string; revenue: number }>; language: string }) => {
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <BarChart3 className="size-8 text-muted-foreground/15 mb-3" />
        <p className="text-xs font-bold text-muted-foreground">No revenue data yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="rvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => (v > 0 ? `${(v / 1000).toFixed(0)}k` : '0')} dx={-4} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || payload.length === 0) return null
            return (
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 shadow-xl">
                <p className="text-xs font-bold">{payload[0].value?.toLocaleString(language)} DZD</p>
              </div>
            )
          }}
        />
        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#rvGrad)" animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  )
})

// --- Recent Deals ---

const RecentDeals = memo(({ deals, language }: { deals: Array<{ id: string; price: number; updatedAt: string | Date; request?: { partName?: string } | null }>; language: string }) => (
  <div className="space-y-1">
    {deals.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="size-6 text-muted-foreground/15 mb-2" />
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">No sales yet</p>
      </div>
    ) : (
      deals.map((deal) => (
        <Link
          key={deal.id}
          to="/dashboard/quotes"
          className="group flex items-center justify-between px-3 py-2.5 -mx-3 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground uppercase tracking-tight truncate">{deal.request?.partName || 'Unknown part'}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
              {new Date(deal.updatedAt).toLocaleDateString(language, { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400 ml-4 shrink-0">
            {(deal.price || 0).toLocaleString(language)} DZD
          </span>
        </Link>
      ))
    )}
  </div>
))

// --- Quick Link ---

const QuickLink = memo(({ to, icon: Icon, title, desc }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) => (
  <Link
    to={to}
    className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200"
  >
    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
      <Icon className="size-5 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-black tracking-tight">{title}</p>
      <p className="text-[11px] text-muted-foreground font-bold mt-0.5">{desc}</p>
    </div>
    <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
  </Link>
))

// --- Main Content ---

function StatsSection({ dashboardData, t, language }: { dashboardData: DashboardData; t: any; language: string }) {
  const { stats, todayStats, recentSales, chartQuotes } = dashboardData

  const acceptedDeals = useMemo(() => recentSales.filter((q) => q.status === 'accepted').slice(0, 5), [recentSales])

  const chartData = useMemo(() => {
    if (chartQuotes.length === 0) return []
    let cumulative = 0
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayEarnings = chartQuotes
        .filter((q) => isSameDay(startOfDay(new Date(q.updatedAt)), startOfDay(date)))
        .reduce((sum, q) => sum + q.price, 0)
      cumulative += dayEarnings
      return { name: format(date, 'E').slice(0, 3), revenue: cumulative }
    })
  }, [chartQuotes])

  const todaysChange = useMemo(() => {
    if (todayStats.won === 0) return ''
    const prev = Math.max(stats.won - todayStats.won, 1)
    const pct = Math.round((todayStats.won / prev) * 100)
    return pct > 0 ? `+${pct}% today` : ''
  }, [stats.won, todayStats.won])

  const revenueChange = useMemo(() => {
    if (todayStats.revenue === 0) return ''
    const prev = Math.max(stats.totalRevenue - todayStats.revenue, 1)
    const pct = Math.round((todayStats.revenue / prev) * 100)
    return pct > 0 ? `+${pct}% today` : ''
  }, [stats.totalRevenue, todayStats.revenue])

  const metrics = [
    { label: t('stats.won.label'), value: stats.won, trend: todaysChange, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50', icon: CheckCircle2 },
    { label: t('stats.active.label'), value: stats.pending, trend: '', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50', icon: Zap },
    { label: t('stats.win_rate.label'), value: `${stats.winRate.toFixed(1)}%`, trend: '', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/50', icon: MessageSquare, isFormatted: true },
    { label: t('stats.earnings.label'), value: `${stats.totalRevenue.toLocaleString(language)} DZD`, trend: revenueChange, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50', icon: TrendingUp, isFormatted: true },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={cn('flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all', m.color)}>
            <div className="flex items-center gap-1.5">
              <m.icon className="size-4" />
              <span className="text-xl font-black tabular-nums leading-none">{typeof m.value === 'number' ? m.value : m.value}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">{m.label}</span>
            {m.trend ? (
              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">{m.trend}</span>
            ) : null}
          </div>
        ))}
      </div>

      {/* Chart + Deals */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-5 flex flex-col">
          <div className="mb-2 shrink-0">
            <h3 className="text-sm font-black uppercase tracking-tight">{t('charts.revenue_velocity.title')}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{t('charts.revenue_velocity.desc')}</p>
          </div>
          <div className="h-[260px] -mx-1">
            <RevenueChart chartData={chartData} language={language} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-5 flex flex-col">
          <div className="mb-4 shrink-0">
            <h3 className="text-sm font-black uppercase tracking-tight">{t('tables.sales_history')}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{t('tables.recent_deals')}</p>
          </div>
          <div className="flex-1 min-h-0">
            <RecentDeals deals={acceptedDeals} language={language} />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink to="/dashboard/quotes" icon={BarChart3} title={t('actions.view_quotes')} desc={`${stats.totalQuotes} quotes submitted`} />
        <QuickLink to="/explore" icon={ShoppingBag} title={t('actions.browse_requests')} desc="Discover live requests from buyers" />
      </div>
    </div>
  )
}

// --- Main Component ---

export function SellerOverview() {
  const { t, i18n } = useTranslation(['dashboard/seller', 'dashboard/layout'])
  const { data: user } = useAuth()

  const { statsPromise } = routeApi.useLoaderData()

  return (
    <div className="flex-1 flex flex-col gap-4 w-full pb-8">
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
            <Sparkles className="size-4 mr-2" />
            {t('actions.explore_cta')}
          </Link>
        </Button>
      </div>

      {/* Content */}
      <React.Suspense fallback={<OverviewSkeleton />}>
        <Await promise={statsPromise!}>
          {(dashboardData) => <StatsSection dashboardData={dashboardData} t={t} language={i18n.language} />}
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
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-[340px] rounded-2xl" />
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-[84px] rounded-2xl" />
        <Skeleton className="h-[84px] rounded-2xl" />
      </div>
    </div>
  )
}
