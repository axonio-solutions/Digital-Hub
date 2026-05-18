'use client'

import { useTranslation } from 'react-i18next'
import {
  Coins,
  TrendingUp,
  UserPlus,
  Package,
  Banknote,
  Users,
  HelpCircle,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { DirectionProvider } from '@/components/ui/direction'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  useCreditTransactions,
  useRevenueMetrics,
} from '@/features/credits/hooks/use-credits'

const DATE_LOCALE: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-DZ',
}

export function RevenueMetrics() {
  const { t, i18n } = useTranslation('dashboard/credits')
  const locale = DATE_LOCALE[i18n.language] || 'en-US'
  const { data: metrics, isLoading, isError, refetch } = useRevenueMetrics()
  const { data: allTransactions = [] } = useCreditTransactions()

  const transactions = allTransactions.filter((txn: any) => txn.type !== 'quote_spent')

  const metricCards = [
    {
      label: t('revenue.metrics.monthly_revenue'),
      value: metrics?.monthlyRevenue ?? 0,
      desc: t('revenue.metrics.monthly_revenue_desc'),
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'from-emerald-500/10 to-emerald-600/5',
      format: (v: number) => `${v.toLocaleString()} ${t('currency_dzd')}`,
    },
    {
      label: t('revenue.metrics.all_time_revenue'),
      value: metrics?.allTimeRevenue ?? 0,
      desc: t('revenue.metrics.all_time_revenue_desc'),
      icon: Banknote,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'from-blue-500/10 to-blue-600/5',
      format: (v: number) => `${v.toLocaleString()} ${t('currency_dzd')}`,
    },
    {
      label: t('revenue.metrics.credits_spent'),
      value: metrics?.totalCreditsSpent ?? 0,
      desc: t('revenue.metrics.credits_spent_desc'),
      icon: Coins,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'from-violet-500/10 to-violet-600/5',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: t('revenue.metrics.active_with_credits'),
      value: metrics?.activeSellersWithCredits ?? 0,
      desc: t('revenue.metrics.active_with_credits_desc'),
      icon: Users,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'from-amber-500/10 to-amber-600/5',
      format: (v: number) => `${v}/${metrics?.totalActiveSellers ?? 0}`,
    },
    {
      label: t('revenue.metrics.new_sellers'),
      value: metrics?.newSellersThisMonth ?? 0,
      desc: t('revenue.metrics.new_sellers_desc'),
      icon: UserPlus,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'from-rose-500/10 to-rose-600/5',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: t('revenue.metrics.total_packages'),
      value: metrics?.totalPackages ?? 0,
      desc: t('revenue.metrics.total_packages_desc'),
      icon: Package,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'from-sky-500/10 to-sky-600/5',
      format: (v: number) => v.toLocaleString(),
    },
  ]

  if (isLoading && !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    )
  }

  if (isError && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <HelpCircle className="size-8 text-muted-foreground/50" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center max-w-xs">
          {t('revenue.no_transactions')}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs font-bold">
          <RefreshCw className="size-3" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <DirectionProvider dir={i18n.dir()}>
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className={cn(
              'flex flex-col gap-1.5 px-4 py-3.5 rounded-2xl transition-all bg-gradient-to-br',
              m.bg,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {m.label}
              </span>
              <m.icon className={cn('size-4', m.color)} />
            </div>
            <span className={cn('text-xl sm:text-2xl font-black tabular-nums leading-none', m.color)}>
              {m.format(m.value)}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-tight">
              {m.desc}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
            {t('revenue.transactions')}
          </p>
          {transactions.length > 20 && (
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              {t('revenue.showing_latest', { count: 20 })}
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm font-medium">
              {t('revenue.no_transactions')}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.slice(0, 20).map((txn: any) => (
                <div key={txn.id} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors">
                  <Avatar className="size-8 rounded-xl shrink-0">
                    <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300">
                      {txn.seller?.name?.substring(0, 2).toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm truncate">
                        {txn.seller?.name || txn.seller?.storeName || t('revenue.unknown_seller')}
                      </span>
                      <GlowingBadge
                        variant={txn.type === 'bonus' ? 'warning' : 'success'}
                        className="text-[9px] uppercase shrink-0"
                      >
                        {t(`revenue.transaction_types.${txn.type}`)}
                      </GlowingBadge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{txn.description || t(`revenue.transaction_types.${txn.type}`)}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="whitespace-nowrap">{new Date(txn.createdAt).toLocaleDateString(locale)}</span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'text-sm font-black tabular-nums shrink-0',
                      txn.amount > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400',
                    )}
                  >
                    {txn.amount > 0 ? '+' : ''}
                    {txn.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </DirectionProvider>
  )
}
