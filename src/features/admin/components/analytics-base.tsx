'use client'

import { HelpCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Stat, StatIndicator, StatLabel, StatValue } from '@/components/ui/stat'
import { cn } from '@/lib/utils'

export interface AnalyticsMetric {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface AnalyticsBaseSharedProps {
  title: string
  subtitle: string
  headerIcon: ReactNode
  headerGradient: string
  badgeContent?: ReactNode
  metrics: Array<AnalyticsMetric>
  chartsSectionTitle?: string
  chartsContent?: ReactNode
  mapTitle: string
  mapDescription: string
  mapContent: ReactNode
}

interface AnalyticsBaseLoadingProps extends AnalyticsBaseSharedProps {
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry?: () => void
  hasData: boolean
}

export type AnalyticsBaseProps = AnalyticsBaseLoadingProps

export function AnalyticsBase({
  title,
  subtitle,
  headerIcon,
  headerGradient,
  badgeContent,
  metrics,
  chartsSectionTitle,
  chartsContent,
  mapTitle,
  mapDescription,
  mapContent,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  hasData,
}: AnalyticsBaseProps) {
  if (isLoading && !hasData) {
    return <AdminAnalyticsSkeleton />
  }

  if (isError && !hasData) {
    return (
      <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
        <SectionError message={errorMessage} onRetry={onRetry} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'size-10 rounded-2xl flex items-center justify-center text-white font-black text-sm uppercase shrink-0',
              headerGradient,
            )}
          >
            {headerIcon}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {subtitle}
            </p>
          </div>
        </div>
        {badgeContent && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            {badgeContent}
          </div>
        )}
      </div>

      <AnalyticsMetricsGrid metrics={metrics} />

      {chartsSectionTitle && chartsContent && (
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
            {chartsSectionTitle}
          </p>
          <div className="grid gap-4 lg:grid-cols-7">{chartsContent}</div>
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border shadow-sm p-5 sm:p-8 overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-0.5">
            <h3 className="font-black text-lg text-foreground uppercase leading-tight">
              {mapTitle}
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {mapDescription}
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-center bg-slate-50/5 dark:bg-slate-900/5 rounded-3xl overflow-hidden min-h-[350px] sm:min-h-[450px] lg:min-h-[500px]">
          {mapContent}
        </div>
      </div>
    </div>
  )
}

export function AnalyticsMetricsGrid({
  metrics,
}: {
  metrics: Array<AnalyticsMetric>
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <AnalyticsMetricCard key={m.label} metric={m} />
      ))}
    </div>
  )
}

function analyticsIndicatorColor(color: string) {
  if (color.includes('blue')) return 'info' as const
  if (color.includes('emerald')) return 'success' as const
  if (color.includes('amber')) return 'warning' as const
  if (color.includes('rose')) return 'error' as const
  return 'default' as const
}

export function AnalyticsMetricCard({ metric }: { metric: AnalyticsMetric }) {
  const Icon = metric.icon
  return (
    <>
      {/* Mobile */}
      <div
        className={cn(
          'flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all sm:hidden',
          metric.color,
        )}
      >
        <div className="flex items-center gap-1.5">
          <Icon className="size-4" />
          <span className="text-xl font-black tabular-nums leading-none">
            {metric.value}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">
          {metric.label}
        </span>
      </div>
      {/* Desktop */}
      <div className="hidden sm:block">
        <Stat>
          <StatLabel>{metric.label}</StatLabel>
          <StatIndicator
            variant="icon"
            color={analyticsIndicatorColor(metric.color)}
          >
            <Icon />
          </StatIndicator>
          <StatValue>{metric.value}</StatValue>
        </Stat>
      </div>
    </>
  )
}

export function SectionError({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <HelpCircle className="size-8 text-muted-foreground/50" />
      {message && (
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center max-w-xs">
          {message}
        </p>
      )}
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

export function AdminAnalyticsSkeleton() {
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
