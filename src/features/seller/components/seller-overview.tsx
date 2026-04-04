import { useMemo } from 'react'
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
import { useSellerQuotes } from '@/features/marketplace/hooks/use-marketplace'
import { useOpenRequests } from '@/features/requests/hooks/use-requests'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function SellerOverview() {
  const { t, i18n } = useTranslation(['dashboard/seller', 'dashboard/layout'])
  const { data: user } = useAuth()
  const sellerId = user?.id || ''

  const { data: myQuotes = [], isLoading: loadingQuotes } =
    useSellerQuotes(sellerId)
  const { data: openRequests = [], isLoading: loadingRequests } =
    useOpenRequests()

  // Calculate Metrics
  const stats = useMemo(() => {
    const won = myQuotes.filter((q: any) => q.status === 'accepted').length
    const pending = myQuotes.filter((q: any) => q.status === 'pending').length
    const winRate = myQuotes.length > 0 ? (won / myQuotes.length) * 100 : 0
    const totalRevenue = myQuotes
      .filter((q: any) => q.status === 'accepted')
      .reduce((acc: number, q: any) => acc + q.price, 0)

    return { won, pending, winRate, totalRevenue }
  }, [myQuotes])

  // Chart Data (Live Revenue for last 7 days)
  const chartData = useMemo(() => {
    let cumulative = 0
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const label = format(date, 'eee')

      const dayEarnings = myQuotes
        .filter((q: any) =>
          q.status === 'accepted' &&
          isSameDay(startOfDay(new Date(q.updatedAt)), startOfDay(date))
        )
        .reduce((sum: number, q: any) => sum + q.price, 0)

      cumulative += dayEarnings
      return { name: label, revenue: cumulative }
    })
  }, [myQuotes])

  if (loadingQuotes || loadingRequests) {
    return <SellerOverviewSkeleton />
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('nav.overview', { ns: 'dashboard/layout' })}</h2>
          <p className="text-muted-foreground">
            {t('welcome', { name: user?.name || 'Seller' })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild size="sm">
            <Link to="/dashboard">{t('go_to_market')}</Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview - Premium Section Cards Style */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        {/* Won Deals */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('stats.won.label')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-500">
              {stats.won}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('stats.won.sub')}
            </div>
            <div className="text-muted-foreground">{t('stats.won.desc')}</div>
          </CardFooter>
        </Card>

        {/* Active Bids */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('stats.active.label')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600 dark:text-blue-500">
              {stats.pending}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('stats.active.sub')}
            </div>
            <div className="text-muted-foreground">{t('stats.active.desc')}</div>
          </CardFooter>
        </Card>

        {/* Win Rate */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('stats.win_rate.label')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-600 dark:text-orange-500">
              {stats.winRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('stats.win_rate.sub')}
            </div>
            <div className="text-muted-foreground">{t('stats.win_rate.desc')}</div>
          </CardFooter>
        </Card>

        {/* Earnings */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('stats.earnings.label')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600 dark:text-purple-500">
              {stats.totalRevenue.toLocaleString(i18n.language)} <span className="text-sm font-normal text-muted-foreground">{t('currency')}</span>
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('stats.earnings.sub')}
            </div>
            <div className="text-muted-foreground">{t('stats.earnings.desc')}</div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('charts.revenue_velocity.title')}</CardTitle>
            <CardDescription>
              {t('charts.revenue_velocity.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="ps-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toLocaleString(i18n.language)} ${t('currency')}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {t('currency')}
                              </span>
                              <span className="font-bold text-muted-foreground text-[0.70rem]">
                                {payload[0].value?.toLocaleString(i18n.language)}
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('charts.offer_distribution.title')}</CardTitle>
            <CardDescription>{t('charts.offer_distribution.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: t('pie.accepted'), value: stats.won, fill: 'hsl(var(--primary))' },
                      { name: t('pie.pending'), value: stats.pending, fill: 'hsl(var(--primary) / 0.5)' },
                      { name: t('pie.missed'), value: Math.max(0, myQuotes.length - stats.won - stats.pending), fill: 'hsl(var(--muted))' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: t('pie.accepted'), value: stats.won, fill: 'hsl(var(--primary))' },
                      { name: t('pie.pending'), value: stats.pending, fill: 'hsl(var(--primary) / 0.5)' },
                      { name: t('pie.missed'), value: Math.max(0, myQuotes.length - stats.won - stats.pending), fill: 'hsl(var(--muted))' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>{t('pie.accepted')}</span>
                </div>
                <span className="font-bold">{stats.won}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary/50" />
                  <span>{t('pie.pending')}</span>
                </div>
                <span className="font-bold">{stats.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg">{t('tables.open_demands')}</CardTitle>
              <CardDescription>{t('tables.latest_requests')}</CardDescription>
            </div>
            <Badge variant="secondary">{openRequests.length} {t('pie.pending')}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {openRequests.slice(0, 4).map((req: any) => (
                <div key={req.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{req.partName}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.vehicleBrand} • {req.modelYear}
                    </p>
                  </div>
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">{t('tables.review')}</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg">{t('tables.sales_history')}</CardTitle>
              <CardDescription>{t('tables.recent_deals')}</CardDescription>
            </div>
            <Badge variant="outline">Verified</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myQuotes.filter((q: any) => q.status === 'accepted').slice(0, 4).map((q: any) => (
                <div key={q.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{q.request?.partName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(q.price || 0).toLocaleString(i18n.language)} {t('currency')}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {new Date(q.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {myQuotes.filter((q: any) => q.status === 'accepted').length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="size-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">{t('tables.no_sales')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


function SellerOverviewSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

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
    </div>
  )
}
