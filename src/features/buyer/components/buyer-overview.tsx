'use client'

import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Car,
  CheckCircle2,
  MessageSquare,
  Plus,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { PartCard } from '@/components/ui/part-card'
import { Skeleton } from '@/components/ui/skeleton'
import { RequestWizard } from '@/features/requests/components/request-wizard-new'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useBuyerRequests } from '@/features/buyer/hooks/use-buyer'
import {
  useCancelRequest,
  useDeleteRequest,
  useReopenRequest,
} from '@/features/requests/hooks/use-requests'
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from '@/components/ui/stat'
import { cn } from '@/lib/utils'
import { BUYER_ROUTES } from '@/lib/routes'

export function BuyerOverview() {
  const { t } = useTranslation(['dashboard/buyer', 'requests/details'])
  const { toast } = useToast('requests/details')
  const { data: user } = useAuth()
  const buyerId = user?.id || ''
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [editRequestData, setEditRequestData] = useState<any>(null)
  const [pendingAction, setPendingAction] = useState<{
    type: string
    id: string
  } | null>(null)
  const navigate = useNavigate()

  const { data: requests = [], isLoading } = useBuyerRequests(buyerId)
  const { mutate: cancelRequest } = useCancelRequest()
  const { mutate: deleteRequest } = useDeleteRequest()
  const { mutate: reopenRequest } = useReopenRequest()

  const clearPending = useCallback(() => setPendingAction(null), [])

  const handleAction = useCallback(
    (action: { type: string; item: any }) => {
      switch (action.type) {
        case 'view_request':
          navigate({
            to: BUYER_ROUTES.REQUEST_DETAIL_PATTERN,
            params: { requestId: action.item.id },
          })
          break
        case 'edit_request':
          setEditRequestData(action.item)
          break
        case 'close_request':
          setPendingAction({ type: 'close_request', id: action.item.id })
          cancelRequest(action.item.id, {
            onSuccess: () => toast.success('toasts.request_closed'),
            onError: (err: any) =>
              toast.error('toasts.error', { error: err.message }),
            onSettled: clearPending,
          })
          break
        case 'reopen_request':
          setPendingAction({ type: 'reopen_request', id: action.item.id })
          reopenRequest(action.item.id, {
            onSuccess: () => toast.success('toasts.request_reopened'),
            onError: (err: any) =>
              toast.error('toasts.error', { error: err.message }),
            onSettled: clearPending,
          })
          break
        case 'delete_request':
          setPendingAction({ type: 'delete_request', id: action.item.id })
          deleteRequest(action.item.id, {
            onSuccess: () => toast.success('toasts.request_deleted'),
            onError: (err: any) =>
              toast.error('toasts.error', { error: err.message }),
            onSettled: clearPending,
          })
          break
      }
    },
    [navigate, cancelRequest, deleteRequest, reopenRequest, clearPending],
  )

  const { activeRequests, fulfilledRequests, totalQuotes, recentDemands } =
    useMemo(() => {
      const active = requests.filter((r: any) => r.status === 'open')
      const fulfilled = requests.filter((r: any) => r.status === 'fulfilled')
      const quotes = requests.reduce(
        (acc: number, curr: any) => acc + (curr.quotes?.length || 0),
        0,
      )
      const recent = [...requests]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3)
      return {
        activeRequests: active,
        fulfilledRequests: fulfilled,
        totalQuotes: quotes,
        recentDemands: recent,
      }
    }, [requests])

  if (isLoading && buyerId) {
    return <BuyerOverviewSkeleton />
  }

  const metrics = [
    {
      label: t('stats.active.label'),
      value: activeRequests.length,
      icon: Zap,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
    },
    {
      label: t('stats.offers.label'),
      value: totalQuotes,
      icon: MessageSquare,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      label: t('stats.fulfilled.label'),
      value: fulfilledRequests.length,
      icon: CheckCircle2,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/50',
    },
  ]

  return (
    <div className="flex-1 flex flex-col gap-4 w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-sm uppercase shadow-lg shadow-primary/20 shrink-0">
              {(user?.name || 'U').charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {t('welcome', { name: user?.name || 'Driver' })}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsNewRequestOpen(true)}
          className="hidden sm:inline-flex font-black uppercase text-xs tracking-widest h-11 px-6 shadow-lg shadow-primary/20 rounded-2xl w-full sm:w-auto"
        >
          <Plus className="size-4 me-2" />
          {t('new_demand', 'New Demand')}
        </Button>
      </div>

      {requests.length > 0 && (
        <>
          {/* Mobile */}
          <div className="grid grid-cols-3 gap-3 sm:hidden">
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
                    {m.value}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            {metrics.map((m) => (
              <Stat key={m.label}>
                <StatLabel>{m.label}</StatLabel>
                <StatIndicator
                  variant="icon"
                  color={
                    m.color.includes('blue')
                      ? 'info'
                      : m.color.includes('emerald')
                        ? 'success'
                        : 'warning'
                  }
                >
                  <m.icon />
                </StatIndicator>
                <StatValue>{m.value}</StatValue>
              </Stat>
            ))}
          </div>
        </>
      )}

      <Button
        onClick={() => setIsNewRequestOpen(true)}
        className="sm:hidden font-black uppercase text-xs tracking-widest h-11 px-6 shadow-lg shadow-primary/20 rounded-2xl w-full"
      >
        <Plus className="size-4 me-2" />
        {t('new_demand', 'New Demand')}
      </Button>

      {requests.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
              {t('recent.title')}
            </p>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs font-bold gap-1"
            >
              <Link to={BUYER_ROUTES.REQUESTS}>
                {t('recent.view_all')}{' '}
                <ArrowRight className="size-3 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {recentDemands.map((req: any) => (
              <PartCard
                key={req.id}
                id={req.id}
                title={req.partName}
                brand={req.vehicleBrand || req.brand?.brand}
                brandImageUrl={req.brand?.imageUrl}
                modelYear={req.modelYear}
                category={req.category?.name}
                categoryImageUrl={req.category?.imageUrl}
                region={req.brand?.clusterRegion}
                imageUrls={req.imageUrls}
                quotesCount={req.quotes?.length}
                status={req.status}
                createdAt={req.createdAt}
                notes={req.notes}
                onClick={() =>
                  handleAction({ type: 'view_request', item: req })
                }
                onEdit={
                  req.status === 'open'
                    ? () => handleAction({ type: 'edit_request', item: req })
                    : undefined
                }
                onClose={
                  req.status === 'open'
                    ? () => handleAction({ type: 'close_request', item: req })
                    : undefined
                }
                onReopen={
                  req.status === 'cancelled'
                    ? () => handleAction({ type: 'reopen_request', item: req })
                    : undefined
                }
                onDelete={
                  req.status !== 'fulfilled'
                    ? () => handleAction({ type: 'delete_request', item: req })
                    : undefined
                }
                isProcessing={pendingAction?.id === req.id}
                className="w-full"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16 px-4">
          <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-inner">
            <Car className="size-10 text-primary/50" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-black tracking-tight">
              {t('empty.title')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t('empty.desc')}
            </p>
          </div>
          <Button
            onClick={() => setIsNewRequestOpen(true)}
            size="lg"
            className="font-black uppercase text-xs tracking-widest h-12 px-8 rounded-2xl shadow-lg shadow-primary/20"
          >
            <Plus className="size-4 me-2" />
            {t('empty.cta', 'Post Your First Request')}
          </Button>
        </div>
      )}

      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95dvh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
          <div className="h-dvh max-h-[85dvh]">
            <RequestWizard
              onSuccess={() => setIsNewRequestOpen(false)}
              onCancel={() => setIsNewRequestOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editRequestData}
        onOpenChange={(open) => !open && setEditRequestData(null)}
      >
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95dvh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
          <div className="h-dvh max-h-[85dvh]">
            <RequestWizard
              initialData={editRequestData}
              onSuccess={() => setEditRequestData(null)}
              onCancel={() => setEditRequestData(null)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BuyerOverviewSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-3.5 w-56 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-11 w-full sm:w-40 rounded-2xl" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
