import { useMemo, memo } from 'react'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format, subDays, isSameDay, startOfDay } from 'date-fns'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useSellerDashboardData } from '@/features/marketplace/hooks/use-marketplace'
import { useOpenRequests } from '@/features/requests/hooks/use-requests'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// --- Memoized Child Components ---

const StatsCards = memo(({ stats, language, t }: { stats: any; language: string; t: any }) => (
  <div className="grid grid-cols-1 gap-5 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-sm sm:grid-cols-2 lg:grid-cols-4">
    <Card className="@container/card border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-2xl group transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('stats.won.label')}</CardDescription>
        <CardTitle className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {stats.won}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
        <div className="line-clamp-1 flex gap-2 font-bold dark:text-slate-200 uppercase text-[10px]">
          {t('stats.won.sub')}
        </div>
        <div className="text-muted-foreground dark:text-slate-500 text-[11px]">{t('stats.won.desc')}</div>
      </CardFooter>
    </Card>

    <Card className="@container/card border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-2xl group transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('stats.active.label')}</CardDescription>
        <CardTitle className="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
          {stats.pending}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
        <div className="line-clamp-1 flex gap-2 font-bold dark:text-slate-200 uppercase text-[10px]">
          {t('stats.active.sub')}
        </div>
        <div className="text-muted-foreground dark:text-slate-500 text-[11px]">{t('stats.active.desc')}</div>
      </CardFooter>
    </Card>

    <Card className="@container/card border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-2xl group transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('stats.win_rate.label')}</CardDescription>
        <CardTitle className="text-3xl font-bold tabular-nums text-orange-600 dark:text-orange-400">
          {stats.winRate.toFixed(1)}%
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
        <div className="line-clamp-1 flex gap-2 font-bold dark:text-slate-200 uppercase text-[10px]">
          {t('stats.win_rate.sub')}
        </div>
        <div className="text-muted-foreground dark:text-slate-500 text-[11px]">{t('stats.win_rate.desc')}</div>
      </CardFooter>
    </Card>

    <Card className="@container/card border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-2xl group transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('stats.earnings.label')}</CardDescription>
        <CardTitle className="text-3xl font-bold tabular-nums text-purple-600 dark:text-purple-400">
          {stats.totalRevenue.toLocaleString(language)} <span className="text-xs font-normal text-muted-foreground">{t('currency')}</span>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
        <div className="line-clamp-1 flex gap-2 font-bold dark:text-slate-200 uppercase text-[10px]">
          {t('stats.earnings.sub')}
        </div>
        <div className="text-muted-foreground dark:text-slate-500 text-[11px]">{t('stats.earnings.desc')}</div>
      </CardFooter>
    </Card>
  </div>
))

const RevenueChart = memo(({ chartData, language, t }: { chartData: any[]; language: string; t: any }) => (
  <Card className="col-span-12 lg:col-span-4 bg-background rounded-[2rem] border border-border shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg overflow-hidden">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg font-bold text-foreground tracking-tight uppercase underline decoration-primary/30 underline-offset-8">{t('charts.revenue_velocity.title')}</CardTitle>
      <CardDescription className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">
        {t('charts.revenue_velocity.desc')}
      </CardDescription>
    </CardHeader>
    <CardContent className="pl-2 pt-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#888888" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} className="uppercase" />
            <YAxis stroke="#888888" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toLocaleString(language)} ${t('currency')}`} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-xl animate-in zoom-in-95 duration-200">
                      <div className="grid gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">{t('charts.revenue_velocity.title')}</span>
                        <span className="text-sm font-bold text-foreground">{payload[0].value?.toLocaleString(language)} {t('currency')}</span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} fill="url(#revenue-gradient)" fillOpacity={1} animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
))

const OfferDistribution = memo(({ stats, myQuotesLength, t }: { stats: any; myQuotesLength: number; t: any }) => (
  <Card className="col-span-12 lg:col-span-3 bg-background rounded-[2rem] border border-border shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg overflow-hidden">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg font-bold text-foreground tracking-tight uppercase underline decoration-primary/30 underline-offset-8">{t('charts.offer_distribution.title')}</CardTitle>
      <CardDescription className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">{t('charts.offer_distribution.desc')}</CardDescription>
    </CardHeader>
    <CardContent className="pt-2">
      <div className="h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: t('pie.accepted'), value: stats.won, fill: '#10b981' },
                { name: t('pie.pending'), value: stats.pending, fill: '#3b82f6' },
                { name: t('pie.missed'), value: Math.max(0, myQuotesLength - stats.won - stats.pending), fill: '#94a3b8' },
              ]}
              cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" animationDuration={1000} strokeWidth={0}
            >
              {[
                { name: t('pie.accepted'), value: stats.won, fill: '#10b981' },
                { name: t('pie.pending'), value: stats.pending, fill: '#3b82f6' },
                { name: t('pie.missed'), value: Math.max(0, myQuotesLength - stats.won - stats.pending), fill: '#94a3b8' },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{payload[0].name}: {payload[0].value}</span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
             <p className="text-2xl font-bold text-slate-900 dark:text-white">{myQuotesLength}</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quotes</p>
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-3 px-4">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span>{t('pie.accepted')}</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400">{stats.won}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-blue-500" />
            <span>{t('pie.pending')}</span>
          </div>
          <span className="text-blue-600 dark:text-blue-400">{stats.pending}</span>
        </div>
      </div>
    </CardContent>
  </Card>
))

const OpenDemandsTable = memo(({ openRequests, t }: { openRequests: any[]; t: any }) => (
  <Card className="bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
      <div className="space-y-1">
        <CardTitle className="text-lg font-bold text-foreground tracking-tight uppercase underline decoration-primary/30 underline-offset-8">{t('tables.open_demands')}</CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">{t('tables.latest_requests')}</CardDescription>
      </div>
      <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-tighter text-[10px] px-3 py-1">
        {openRequests.length} {t('pie.pending')}
      </Badge>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {openRequests.slice(0, 4).map((req: any) => (
          <div key={req.id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-4 last:border-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 p-2 rounded-xl transition-colors cursor-pointer group/item">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-950 dark:text-slate-100 uppercase tracking-tight">{req.partName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.vehicleBrand} • {req.modelYear}</p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-bold uppercase tracking-tight rounded-lg border-border group-hover/item:bg-primary group-hover/item:text-primary-foreground group-hover/item:border-primary transition-all">{t('tables.review')}</Button>
            </Link>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
))

const SalesHistoryTable = memo(({ myQuotes, language, t }: { myQuotes: any[]; language: string; t: any }) => (
  <Card className="bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
      <div className="space-y-1">
        <CardTitle className="text-lg font-bold text-foreground tracking-tight uppercase underline decoration-emerald-500/30 underline-offset-8">{t('tables.sales_history')}</CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">{t('tables.recent_deals')}</CardDescription>
      </div>
      <Badge variant="outline" className="rounded-full bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-bold uppercase tracking-tighter text-[10px] px-3 py-1">Verified</Badge>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {myQuotes.filter((q: any) => q.status === 'accepted').slice(0, 4).map((q: any) => (
          <div key={q.id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-4 last:border-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 p-2 rounded-xl transition-colors cursor-pointer">
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground uppercase tracking-tight">{q.request?.partName}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                {(q.price || 0).toLocaleString(language)} {t('currency')}
              </p>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              {new Date(q.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {myQuotes.filter((q: any) => q.status === 'accepted').length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="size-6 text-muted-foreground/30" />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('tables.no_sales')}</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
))

// --- Main Layout Component ---

import { Await, getRouteApi } from '@tanstack/react-router'
import React from 'react'

const routeApi = getRouteApi('/_authed/dashboard/')

function StatsSection({ dashboardData, t, language }: { dashboardData: any, t: any, language: string }) {
  const stats = dashboardData?.stats || { won: 0, pending: 0, winRate: 0, totalRevenue: 0, totalQuotes: 0 }
  const myQuotesLength = stats.totalQuotes || 0
  const myQuotes = dashboardData?.recentSales || []
  
  const chartData = useMemo(() => {
    if (!dashboardData?.chartQuotes) return []
    let cumulative = 0
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayEarnings = dashboardData.chartQuotes
        .filter((q: any) => isSameDay(startOfDay(new Date(q.updatedAt)), startOfDay(date)))
        .reduce((sum: number, q: any) => sum + q.price, 0)
      cumulative += dayEarnings
      return { name: format(date, 'eee'), revenue: cumulative }
    })
  }, [dashboardData?.chartQuotes])

  return (
    <>
      <StatsCards stats={stats} language={language} t={t} />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart chartData={chartData} language={language} t={t} />
        <OfferDistribution stats={stats} myQuotesLength={myQuotesLength} t={t} />
      </div>
      <SalesHistoryTable myQuotes={myQuotes} language={language} t={t} />
    </>
  )
}

export function SellerOverview() {
  const { t, i18n } = useTranslation(['dashboard/seller', 'dashboard/layout'])
  const { data: user } = useAuth()
  
  const { statsPromise, feedPromise } = routeApi.useLoaderData()

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 pt-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto w-full pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            {t('nav.overview', { ns: 'dashboard/layout' })}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              {t('welcome', { name: user?.name || 'Seller' })}
            </span>
            <span className="h-[1px] w-8 bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild size="sm" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold uppercase tracking-tight">
            <Link to="/dashboard">{t('go_to_market')}</Link>
          </Button>
        </div>
      </div>

      <React.Suspense fallback={<StatsSkeleton />}>
        <Await promise={statsPromise}>
          {(dashboardData) => <StatsSection dashboardData={dashboardData} t={t} language={i18n.language} />}
        </Await>
      </React.Suspense>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        <React.Suspense fallback={<Skeleton className="h-[400px] w-full rounded-[2rem]" />}>
          <Await promise={feedPromise}>
            {(openRequests) => <OpenDemandsTable openRequests={openRequests} t={t} />}
          </Await>
        </React.Suspense>
        
        {/* SalesHistoryTable was moved into StatsSection to consume statsPromise without an extra grid wrapper. To correct layout: */}
        <div className="hidden"></div> 
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[80px]" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-3 w-[180px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7 pt-4">
        <Skeleton className="col-span-4 h-[400px] rounded-[2rem]" />
        <Skeleton className="col-span-3 h-[400px] rounded-[2rem]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
         {/* Placeholder to match the grid visually if needed */}
         <div className="h-4"></div>
      </div>
    </div>
  )
}
