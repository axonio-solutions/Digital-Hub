'use client'

import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Download,
  Users,
  Store,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  Database,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useAdminDashboardStats,
  useSystemMetrics,
} from '@/features/admin/hooks/use-analytics'
import { useRecentActivity } from '@/features/admin/hooks/use-admin'
import { MarketplaceActivityTable } from './marketplace-activity-table'
import { type MarketplaceActivity } from './marketplace-columns'

function DonutGauge({ value, max, label, isHealthy }: { value: number; max: number; label: string; isHealthy: boolean }) {
  const pct = Math.min((value / max) * 100, 100)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const color = isHealthy ? 'hsl(160,84%,39%)' : 'hsl(30,80%,50%)'
  const trackColor = 'hsl(var(--muted))'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          {/* Glow effect */}
          <defs>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke={trackColor} strokeWidth="12" />
          {/* Value arc */}
          <circle
            cx="60" cy="60" r={radius} fill="none" stroke={color}
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#gaugeGlow)"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tabular-nums tracking-tighter text-foreground">
            {value.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight mt-0.5">
            {label}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn('size-1.5 rounded-full', isHealthy ? 'bg-emerald-500' : 'bg-amber-500')} />
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-widest',
          isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
        )}>
          {isHealthy ? 'Healthy' : 'Low Supply'}
        </span>
      </div>
    </div>
  )
}

export function AdminOverview() {
  const { t } = useTranslation(['dashboard/admin', 'dashboard/layout'])
  const { data: user } = useAuth()
  const { data: stats, isLoading: isStatsLoading } = useAdminDashboardStats()
  const { data: systemMetrics, isLoading: isMetricsLoading } = useSystemMetrics()
  const { data: recentActivity } = useRecentActivity()

  const isLoading = isStatsLoading || isMetricsLoading

  const volData = systemMetrics?.requestVolume || []
  const displayVol = useMemo(() => volData.slice(-10), [volData])
  const maxVol = useMemo(
    () => Math.max(...displayVol.map((d: any) => d.count || 0), 1),
    [displayVol],
  )

  const registrations = systemMetrics?.recentRegistrations?.[0]?.count || 0
  const dbSize = systemMetrics?.dbStats?.totalSize || '—'

  const allRequests = recentActivity?.data || []
  const tableData: MarketplaceActivity[] = useMemo(
    () =>
      allRequests.map((req: any) => ({
        id: req.id,
        partName: req.partName,
        buyer: req.buyer?.name || 'Guest',
        brand: req.vehicleBrand,
        year: req.modelYear,
        status: req.status,
        offers: req.quotes?.length || 0,
        createdAt:
          typeof req.createdAt === 'string'
            ? req.createdAt
            : req.createdAt?.toISOString?.() || new Date().toISOString(),
        image: req.imageUrls?.[0],
      })),
    [allRequests],
  )

  if (isLoading && !stats && !systemMetrics) {
    return <AdminOverviewSkeleton />
  }

  const totalBuyers = stats?.totalBuyers || 0
  const totalSellers = stats?.totalSellers || 0
  const openRequestsCount = stats?.openRequests || 0
  const totalQuotes = stats?.totalQuotes || 0
  const avgOffers = stats?.avgOffersPerRequest || 0
  const marketHealth = stats?.marketHealth || 'N/A'
  const isHealthy = marketHealth.toLowerCase().includes('healthy')

  const metrics = [
    { label: t('stats.buyers.label'), value: totalBuyers, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: t('stats.sellers.label'), value: totalSellers, icon: Store, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: t('stats.demands.label'), value: openRequestsCount, icon: ClipboardList, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { label: t('stats.supply.label'), value: totalQuotes, icon: MessageSquare, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30' },
  ]

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-violet-500/20 shrink-0">
              {(user?.name || 'A').charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {t('welcome', { name: user?.name || 'Admin' })}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {isHealthy ? t('overview.thriving') : t('overview.needs_attention')}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 gap-2 font-bold text-xs uppercase tracking-wider shadow-sm w-full sm:w-auto"
        >
          <Download size={14} />
          {t('export')}
        </Button>
      </div>

      {/* Compact Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <span className="text-xl font-black tabular-nums leading-none">
                {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Health Snapshot Row - Fixed mobile badge overflow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <TrendingUp className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-0.5">
              {t('overview.avg_offers')}
            </p>
            <p className="text-sm font-black tabular-nums leading-tight text-slate-900 dark:text-slate-100">{avgOffers.toFixed(1)}</p>
          </div>
          <GlowingBadge
            variant={isHealthy ? 'success' : 'warning'}
            pulse={!isHealthy}
            className="shrink-0 text-[9px]"
          >
            <span className="sm:max-w-[80px] truncate">
              {isHealthy ? t('health.optimal') : t('health.low')}
            </span>
          </GlowingBadge>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-500/10 shrink-0">
            <UserPlus className="size-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-0.5">
              {t('overview.recent_registrations')}
            </p>
            <p className="text-sm font-black tabular-nums leading-tight text-slate-900 dark:text-slate-100">{registrations.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-amber-500/10 shrink-0">
            <Database className="size-4 text-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-0.5">
              {t('overview.db_size')}
            </p>
            <p className="text-sm font-black tabular-nums leading-tight text-slate-900 dark:text-slate-100">{dbSize}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 dark:text-slate-400/60">
            {t('charts.request_volume.title')}
          </p>
          <Button asChild variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs font-bold gap-1">
            <Link to="/dashboard/admin/buyers">
              {t('overview.view_analytics')} <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          {/* Request Volume Bar Chart */}
          <div className="lg:col-span-4 rounded-2xl bg-card border border-border shadow-sm p-5">
            <div className="flex h-[200px] items-end gap-2 px-2">
              {displayVol.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('charts.request_volume.insufficient')}
                  </p>
                </div>
              ) : (
                displayVol.map((node: any, idx: number) => {
                  const height = (node.count / maxVol) * 100
                  const isHighlight = idx === displayVol.length - 1
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full gap-1">
                      <span className={cn(
                        'text-[9px] font-bold tabular-nums transition-colors',
                        isHighlight
                          ? 'text-primary dark:text-primary'
                          : 'text-muted-foreground/40 dark:text-slate-500/40'
                      )}>
                        {node.count}
                      </span>
                      <div
                        className={cn(
                          'w-full rounded-t-md transition-all duration-300',
                          isHighlight
                            ? 'bg-primary shadow-sm shadow-primary/20 dark:shadow-primary/30'
                            : 'bg-primary/15 hover:bg-primary/30 dark:bg-primary/20 dark:hover:bg-primary/35',
                        )}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <span className="text-[9px] font-medium text-muted-foreground/50 dark:text-slate-500/50 uppercase mt-1 truncate w-full text-center">
                        {node.date?.slice(-2) || '—'}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Donut Gauge - Clean SVG, zero Recharts dependency */}
          <div className="lg:col-span-3 rounded-2xl bg-card border border-border shadow-sm p-5 flex flex-col items-center justify-center">
            <DonutGauge value={avgOffers} max={5} label={t('overview.avg_offers')} isHealthy={isHealthy} />
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 dark:text-slate-400/60">
            {t('overview.recent_activity')}
          </p>
          <Button asChild variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs font-bold gap-1">
            <Link to="/dashboard/admin/audit">
              {t('table.full_audit')} <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>

        <MarketplaceActivityTable data={tableData} />
      </div>
    </div>
  )
}

function AdminOverviewSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-3.5 w-56 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-full sm:w-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3.5 w-40 rounded-md" />
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-[240px] w-full rounded-2xl" />
          <Skeleton className="lg:col-span-3 h-[240px] w-full rounded-2xl" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    </div>
  )
}
