import {
  ShoppingBag,
  TrendingUp,
  Timer,
  Handshake,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlgeriaMap } from './algeria-map'
import { useBuyerAnalytics } from '@/features/admin/hooks/use-analytics'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  Cell,
  LabelList,
} from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo, useState } from 'react'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']

export function BuyerAnalytics() {
  const { t } = useTranslation('dashboard/admin')
  const { data: analytics, isLoading } = useBuyerAnalytics()

  const demandByOrigin = useMemo(() => {
    return [...(analytics?.demandByOrigin || [])].sort((a, b) => a.count - b.count)
  }, [analytics?.demandByOrigin])

  const totalOriginRequests = useMemo(() => {
    return demandByOrigin.reduce((acc: number, curr: any) => acc + curr.count, 0)
  }, [demandByOrigin])

  const BASE_RADIUS = 70;
  const SIZE_INCREMENT = 12;

  const id = "brand-origin-chart"

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    demandByOrigin.forEach((item, i) => {
      config[`color-${i}`] = {
        label: item.label,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }
    })
    return config
  }, [demandByOrigin])

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const activeData = useMemo(() => {
    if (activeIndex === null || !analytics?.requestVolume) return null;
    return analytics.requestVolume[activeIndex];
  }, [activeIndex, analytics?.requestVolume]);

  if (isLoading) {
    return <BuyerAnalyticsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto w-full pb-20 pt-4 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-6 md:px-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            {t('intelligence.buyer')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('subtitle.buyer')}</span>
            <span className="h-[1px] w-8 bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider leading-none">
            {analytics?.metrics?.totalRequests || 0} {t('metrics.inquiries_tracked')}
          </span>
        </div>
      </div>

      {/* Stats Overview - Premium Section Cards Style */}
      <div className="grid grid-cols-1 gap-4 px-6 md:px-10 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        {/* Avg Offers */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('metrics.avg_offers')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600 dark:text-blue-500">
              {analytics?.metrics?.avgOffersPerRequest || '0'}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('metrics.market_liquidity')}
            </div>
            <div className="text-muted-foreground">{t('metrics.avg_offers_desc')}</div>
          </CardFooter>
        </Card>

        {/* Conversion */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('metrics.conversion_rate')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-500">
              {analytics?.metrics?.conversionRate || '0%'}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('metrics.fulfillment_success')}
            </div>
            <div className="text-muted-foreground">{t('metrics.fulfillment_success_desc')}</div>
          </CardFooter>
        </Card>

        {/* Response Time */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('metrics.response_time')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-600 dark:text-orange-500">
              {analytics?.metrics?.avgResponseTime || '0m'}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('metrics.market_velocity')}
            </div>
            <div className="text-muted-foreground">{t('metrics.avg_response_time_desc')}</div>
          </CardFooter>
        </Card>

        {/* Buyer Pool */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('metrics.buyer_pool')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600 dark:text-purple-500">
              {analytics?.metrics?.totalBuyers?.toLocaleString() || '0'}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t('metrics.network_scale')}
            </div>
            <div className="text-muted-foreground">{t('metrics.verified_buyers')}</div>
          </CardFooter>
        </Card>
      </div>

      {/* Analytical Insights */}
      <div className="grid grid-cols-12 gap-8 px-6 md:px-10">
        <Card className="col-span-12 md:col-span-6 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-md overflow-hidden">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase underline decoration-primary/30 underline-offset-8">{t('charts.demand_velocity')}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 px-2">
            <ChartContainer
              config={{
                count: { label: "Requests", color: "hsl(var(--primary))" }
              }}
              className="mx-auto aspect-square max-h-[350px] w-full"
            >
              <RadarChart
                data={analytics?.demandByCategory || []}
                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                cx="50%"
                cy="50%"
                outerRadius="75%"
              >
                <defs>
                  <linearGradient id="radar-gradient-buyer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarGrid className="fill-slate-100/50 dark:fill-slate-800/50" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: "bold" }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                   name="Demand"
                   dataKey="count"
                   stroke="#3b82f6"
                   strokeWidth={2}
                   fill="url(#radar-gradient-buyer)"
                   fillOpacity={1}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-md overflow-hidden" id={id}>
          <ChartStyle id={id} config={chartConfig} />
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase underline decoration-primary/30 underline-offset-8">{t('charts.brand_origin')}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 px-2">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="label" />} />
                {demandByOrigin.map((entry, index) => (
                  <Pie
                    key={`pie-${index}`}
                    data={[entry]}
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={BASE_RADIUS + index * SIZE_INCREMENT}
                    dataKey="count"
                    cornerRadius={6}
                    startAngle={(demandByOrigin.slice(0, index).reduce((sum, d) => sum + d.count, 0) / totalOriginRequests) * 360}
                    endAngle={(demandByOrigin.slice(0, index + 1).reduce((sum, d) => sum + d.count, 0) / totalOriginRequests) * 360}
                  >
                    <Cell fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    <LabelList dataKey="label" position="outside" offset={16} stroke="none" fontSize={10} fontWeight="bold" fill="currentColor" />
                  </Pie>
                ))}
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm flex flex-col group transition-all duration-300 hover:shadow-md overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase leading-none">{t('charts.request_volume_title')}</CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  {activeData ? `${activeData.date}: ${activeData.count} ${t('table.status.open')}` : t('charts.market_throughput')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-6 px-10">
            <ChartContainer config={{ count: { label: "Inquiries", color: "#3b82f6" } }} className="h-72 w-full mt-4">
              <BarChart data={analytics?.requestVolume || []} onMouseLeave={() => setActiveIndex(null)} margin={{ left: 10, right: 10, top: 20, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} className="text-[9px] font-bold text-slate-400 uppercase" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={4} fill="#3b82f6">
                  {(analytics?.requestVolume || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.2} onMouseEnter={() => setActiveIndex(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 md:px-10">
        <div className="bg-white dark:bg-slate-950/50 shadow-sm border border-slate-200 dark:border-slate-800 p-12 rounded-[2.5rem] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-1">
              <h3 className="font-bold text-2xl text-slate-900 dark:text-white uppercase leading-none">{t('distribution.buyer_title')}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('distribution.regional_concentration')}</p>
            </div>
          </div>
          <div className="relative flex items-center justify-center bg-slate-50/5 dark:bg-slate-900/5 rounded-3xl overflow-hidden min-h-[650px]">
             <AlgeriaMap data={analytics?.distribution || []} role="buyer" className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function BuyerAnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto w-full pb-20 pt-4 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-6 md:px-10">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 md:px-10 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-12 gap-8 px-6 md:px-10">
        <Skeleton className="col-span-12 md:col-span-6 h-[450px] rounded-[2rem]" />
        <Skeleton className="col-span-12 md:col-span-6 h-[450px] rounded-[2rem]" />
        <Skeleton className="col-span-12 h-[450px] rounded-[2rem]" />
      </div>
    </div>
  );
}
