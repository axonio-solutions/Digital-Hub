'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Tabs as RetrouiTabs } from '@/components/retroui/Tab'
import {
  ArrowUpDown,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { isAfter, isToday, startOfDay, subDays } from 'date-fns'
import { SellerQuotesTable } from './seller-quotes-table'
import { useToast } from '@/hooks/use-toast'
import { SubmitQuoteForm } from '@/features/marketplace'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useDeleteQuote,
  useSellerQuotes,
} from '@/features/marketplace/hooks/use-marketplace'
import { useSendReminder } from '@/features/quotes/hooks/use-quotes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RequestDetailsDialog } from '@/features/requests/components/request-details-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTaxonomy } from '@/features/taxonomy/hooks/use-taxonomy'

type TimeWindow = 'all' | 'today' | 'week' | 'month'

function getTimeWindowLabel(key: TimeWindow, t: any) {
  return t(`hub.time.${key}`)
}

function getTimeCutoff(window: TimeWindow): Date | null {
  if (window === 'all') return null
  if (window === 'today') return startOfDay(new Date())
  if (window === 'week') return subDays(startOfDay(new Date()), 7)
  return subDays(startOfDay(new Date()), 30)
}

export function SellerQuotesHub() {
  const { t, i18n } = useTranslation('quotes')
  const { toast } = useToast('quotes')
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all')

  const { data: user } = useAuth()
  const sellerId = user?.id || ''
  const navigate = useNavigate()

  const { data: myQuotes = [], isLoading } = useSellerQuotes(sellerId)
  const { data: taxonomy } = useTaxonomy()
  const deleteQuote = useDeleteQuote()
  const { mutate: sendReminder, isPending: isSendingReminder } =
    useSendReminder()

  const brandLogos = useMemo(() => {
    if (!taxonomy?.brands) return undefined
    return taxonomy.brands.reduce((acc: Record<string, string>, brand: any) => {
      if (brand.brand && brand.imageUrl) {
        acc[brand.brand] = brand.imageUrl
      }
      return acc
    }, {})
  }, [taxonomy])

  const handleAction = (action: { type: string; item: any }) => {
    setSelectedQuote(action.item)

    switch (action.type) {
      case 'view_request':
        navigate({ to: '/marketplace/$requestId', params: { requestId: action.item.requestId } })
        break
      case 'update':
        setIsQuoteModalOpen(true)
        break
      case 'delete':
        if (confirm(t('hub.confirm.withdraw'))) {
          deleteQuote.mutate(action.item.id, {
            onSuccess: () => toast.success('hub.toasts.removed'),
          })
        }
        break
    }
  }

  const timeFiltered = useMemo(() => {
    const cutoff = getTimeCutoff(timeWindow)
    if (!cutoff) return myQuotes
    return myQuotes.filter((q: any) => isAfter(new Date(q.createdAt), cutoff))
  }, [myQuotes, timeWindow])

  const { wonQuotes, pendingQuotes, lostQuotes } = useMemo(() => {
    const won = timeFiltered.filter((q: any) => q.status === 'accepted')
    const pending = timeFiltered.filter((q: any) => q.status === 'pending')
    const lost = timeFiltered.filter(
      (q: any) =>
        q.status === 'rejected' ||
        (q.request?.status === 'fulfilled' && q.status !== 'accepted'),
    )
    return { wonQuotes: won, pendingQuotes: pending, lostQuotes: lost }
  }, [timeFiltered])

  const successRate = useMemo(() => {
    if (timeFiltered.length === 0) return 0
    return Math.round((wonQuotes.length / timeFiltered.length) * 100)
  }, [timeFiltered, wonQuotes])

  const pipelineValue = useMemo(
    () =>
      pendingQuotes.reduce((sum: number, q: any) => sum + (q.price || 0), 0),
    [pendingQuotes],
  )
  const wonRevenue = useMemo(
    () => wonQuotes.reduce((sum: number, q: any) => sum + (q.price || 0), 0),
    [wonQuotes],
  )
  const lostValue = useMemo(
    () => lostQuotes.reduce((sum: number, q: any) => sum + (q.price || 0), 0),
    [lostQuotes],
  )

  const tabs = [
    {
      key: 'pending',
      label: t('hub.tabs.active'),
      count: pendingQuotes.length,
    },
    { key: 'won', label: t('hub.tabs.won'), count: wonQuotes.length },
    { key: 'lost', label: t('hub.tabs.lost'), count: lostQuotes.length },
  ]

  const activeData =
    activeTab === 'pending'
      ? pendingQuotes
      : activeTab === 'won'
        ? wonQuotes
        : lostQuotes

  const tabStats = useMemo(() => {
    if (activeTab === 'pending') {
      return [
        {
          key: 'count',
          icon: Clock,
          value: pendingQuotes.length.toString(),
          label: t('hub.tabs.active'),
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
        },
        {
          key: 'pipeline',
          icon: Banknote,
          value: `${pipelineValue.toLocaleString(i18n.language)} DZD`,
          label: t('hub.stats.pipeline'),
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
        },
        {
          key: 'avg',
          icon: TrendingUp,
          value:
            pendingQuotes.length > 0
              ? `${Math.round(pipelineValue / pendingQuotes.length).toLocaleString(i18n.language)} DZD`
              : '—',
          label: t('hub.stats.avg_price'),
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
        },
        {
          key: 'today',
          icon: Calendar,
          value:
            pendingQuotes.length > 0
              ? pendingQuotes
                  .filter((q: any) => isToday(new Date(q.createdAt)))
                  .length.toString()
              : '0',
          label: t('hub.stats.today_active'),
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
        },
      ]
    }
    if (activeTab === 'won') {
      return [
        {
          key: 'count',
          icon: CheckCircle2,
          value: wonQuotes.length.toString(),
          label: t('hub.tabs.won'),
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
        },
        {
          key: 'revenue',
          icon: Banknote,
          value: `${wonRevenue.toLocaleString(i18n.language)} DZD`,
          label: t('hub.stats.total_revenue'),
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
        },
        {
          key: 'rate',
          icon: TrendingUp,
          value: `${successRate}%`,
          label: t('hub.stats.success_rate'),
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
        },
        {
          key: 'avg',
          icon: ArrowUpDown,
          value:
            wonQuotes.length > 0
              ? `${Math.round(wonRevenue / wonQuotes.length).toLocaleString(i18n.language)} DZD`
              : '—',
          label: t('hub.stats.avg_deal'),
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
        },
      ]
    }
    return [
      {
        key: 'count',
        icon: XCircle,
        value: lostQuotes.length.toString(),
        label: t('hub.tabs.lost'),
        color:
          'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50',
      },
      {
        key: 'lostValue',
        icon: TrendingDown,
        value: `${lostValue.toLocaleString(i18n.language)} DZD`,
        label: t('hub.stats.missed_value'),
        color:
          'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50',
      },
      {
        key: 'rate',
        icon: TrendingDown,
        value:
          timeFiltered.length > 0
            ? `${Math.round((lostQuotes.length / timeFiltered.length) * 100)}%`
            : '0%',
        label: t('hub.stats.loss_rate'),
        color:
          'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50',
      },
      {
        key: 'avg',
        icon: ArrowUpDown,
        value:
          lostQuotes.length > 0
            ? `${Math.round(lostValue / lostQuotes.length).toLocaleString(i18n.language)} DZD`
            : '—',
        label: t('hub.stats.avg_missed'),
        color:
          'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50',
      },
    ]
  }, [
    activeTab,
    pendingQuotes,
    wonQuotes,
    lostQuotes,
    pipelineValue,
    wonRevenue,
    lostValue,
    successRate,
    timeFiltered,
    i18n.language,
    t,
  ])

  if (isLoading) {
    return <QuotesHubSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col gap-4 w-full pb-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-sm uppercase shadow-lg shadow-primary/20 shrink-0">
              {(user?.name || 'S').charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {t('hub.title')}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {t('hub.desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tabStats.map((stat) => (
          <div
            key={stat.key}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all',
              stat.color,
            )}
          >
            <div className="flex items-center gap-1.5">
              <stat.icon className="size-4" />
              <span className="text-xl font-black tabular-nums leading-none">
                {stat.value}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <RetrouiTabs value={activeTab} onValueChange={setActiveTab}>
        <RetrouiTabs.List className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
          {tabs.map((tab) => (
            <RetrouiTabs.Trigger
              key={tab.key}
              value={tab.key}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all data-[active]:bg-white dark:data-[active]:bg-slate-800 data-[active]:text-slate-900 dark:data-[active]:text-white data-[active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            >
              {tab.label}
              <Badge
                variant="secondary"
                className="h-4.5 min-w-4.5 px-1 text-[9px] font-black rounded tabular-nums"
              >
                {tab.count}
              </Badge>
            </RetrouiTabs.Trigger>
          ))}
        </RetrouiTabs.List>
      </RetrouiTabs>

      {/* Time window + Table */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 self-start">
        {(
          Object.keys({
            all: 'all',
            today: 'today',
            week: 'week',
            month: 'month',
          }) as Array<TimeWindow>
        ).map((tw) => (
          <button
            key={tw}
            type="button"
            onClick={() => setTimeWindow(tw)}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all',
              timeWindow === tw
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            {getTimeWindowLabel(tw, t)}
          </button>
        ))}
      </div>

      <SellerQuotesTable
        data={activeData}
        onAction={handleAction}
        brandLogos={brandLogos}
      />

      {/* Update Quote Dialog */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="w-[95vw] max-w-[480px] max-h-[92vh] overflow-y-auto rounded-2xl p-0 gap-0 border-0">
          <div className="p-4 sm:p-5">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-base font-black uppercase tracking-tight">
                {t('hub.dialog.update_title')}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase text-muted-foreground mt-1">
                {t('hub.dialog.update_desc')}
              </DialogDescription>
            </DialogHeader>
            {selectedQuote && user && (
              <SubmitQuoteForm
                quoteId={selectedQuote.id}
                requestId={selectedQuote.requestId}
                sellerId={user.id}
                vehicleInfo={{
                  brand: selectedQuote.request?.vehicleBrand || 'Unknown',
                  model: selectedQuote.request?.vehicleModel || 'Unknown',
                  year: selectedQuote.request?.modelYear || 'Unknown',
                }}
                category={
                  selectedQuote.request?.category?.name ||
                  selectedQuote.request?.category
                }
                initialData={{
                  price: selectedQuote.price,
                  condition: selectedQuote.condition,
                  warranty: selectedQuote.warranty,
                }}
                onSuccess={() => setIsQuoteModalOpen(false)}
                layout="compact"
                showContext={false}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <RequestDetailsDialog
        isOpen={isRequestDetailsOpen}
        onOpenChange={setIsRequestDetailsOpen}
        request={selectedQuote?.request}
        quote={selectedQuote}
        footer={
          <div className="pt-6 flex gap-4 w-full">
            {selectedQuote?.status === 'pending' && (
              <Button
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                onClick={() => {
                  setIsRequestDetailsOpen(false)
                  setIsQuoteModalOpen(true)
                }}
              >
                {t('hub.dialog.update_btn')}
              </Button>
            )}
            {selectedQuote?.status === 'accepted' && (
              <Button
                variant="outline"
                disabled={isSendingReminder}
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest"
                onClick={() => {
                  sendReminder(selectedQuote.id, {
                    onSuccess: () => toast.success('hub.toasts.reminder_sent'),
                    onError: () => toast.error('hub.toasts.reminder_error'),
                  })
                }}
              >
                {isSendingReminder
                  ? t('hub.dialog.reminding')
                  : t('hub.dialog.remind_btn')}
              </Button>
            )}
            <Button
              variant="secondary"
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest"
              onClick={() => setIsRequestDetailsOpen(false)}
            >
              {t('hub.dialog.close')}
            </Button>
          </div>
        }
      />
    </div>
  )
}

function QuotesHubSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 w-full animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-2xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-3.5 w-56 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  )
}
