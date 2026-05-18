'use client'

import { useMemo, useState } from 'react'
import { TrendingUp, Timer, Users, BarChart3 } from 'lucide-react'
import { AlgeriaMap } from './algeria-map'
import { useBuyerAnalytics } from '@/features/admin/hooks/use-analytics'
import { AnalyticsBase, AdminAnalyticsSkeleton } from './analytics-base'
import type { AnalyticsMetric } from './analytics-base'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']

export function BuyerAnalytics() {
  const { t } = useTranslation('dashboard/admin')
  const { data: analytics, isLoading, isError, refetch } = useBuyerAnalytics()

  const demandByOrigin = useMemo(() => {
    return [...(analytics?.demandByOrigin || [])].sort((a: any, b: any) => b.count - a.count).slice(0, 5)
  }, [analytics?.demandByOrigin])

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const metrics: AnalyticsMetric[] = [
    {
      label: t('metrics.avg_offers'),
      value: analytics?.metrics?.avgOffersPerRequest?.toString() || '0',
      icon: BarChart3,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: t('metrics.conversion_rate'),
      value: analytics?.metrics?.conversionRate || '0%',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: t('metrics.response_time'),
      value: analytics?.metrics?.avgResponseTime || '0m',
      icon: Timer,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: t('metrics.buyer_pool'),
      value: analytics?.metrics?.totalBuyers?.toLocaleString?.() || '0',
      icon: Users,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
    },
  ]

  const activeData = activeIndex !== null && analytics?.requestVolume
    ? analytics.requestVolume[activeIndex]
    : null

  return (
    <AnalyticsBase
      title={t('intelligence.buyer')}
      subtitle={t('subtitle.buyer')}
      headerIcon={<BarChart3 className="size-5" />}
      headerGradient="bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/20"
      badgeContent={
        <>
          <div className="size-2 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.5)]" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
            {analytics?.metrics?.totalRequests || 0} {t('metrics.inquiries_tracked')}
          </span>
        </>
      }
      metrics={metrics}
      chartsSectionTitle={t('charts.request_volume_title')}
      chartsContent={
        <>
          <div className="lg:col-span-4 rounded-2xl bg-card border border-border shadow-sm p-5">
            <div className="flex h-[200px] items-end gap-2 px-2">
              {(analytics?.requestVolume || []).length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('intelligence_page.no_data')}
                  </p>
                </div>
              ) : (
                <ChartContainer
                  config={{ count: { label: 'Requests', color: '#3b82f6' } }}
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
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3b82f6">
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
                {activeData.date}: {activeData.count} requests
              </p>
            )}
          </div>

          <div className="lg:col-span-3 rounded-2xl bg-card border border-border shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
              {t('charts.brand_origin')}
            </p>
            <div className="space-y-3">
              {demandByOrigin.map((item: any, i: number) => {
                const total = demandByOrigin.reduce((s: number, d: any) => s + d.count, 0) || 1
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
                        style={{
                          width: `${pct}%`,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      }
      mapTitle={t('distribution.buyer_title')}
      mapDescription={t('distribution.regional_concentration')}
      mapContent={
        <AlgeriaMap data={analytics?.distribution || []} role="buyer" className="h-full w-full" />
      }
      isLoading={isLoading}
      isError={isError}
      errorMessage={t('intelligence_page.no_data')}
      onRetry={() => refetch()}
      hasData={!!analytics}
    />
  )
}

export { AdminAnalyticsSkeleton }
