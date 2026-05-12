'use client'

import { useCallback, useMemo, useState } from 'react'
import { Plus, Zap, MessageSquare, CheckCircle2, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useBuyerRequests } from '../hooks/use-buyer'
import { BuyerListView } from './buyer-list-view'
import { BuyerGridView } from './buyer-grid-view'
import { BuyerSkeleton } from './buyer-skeleton'
import { RequestWizard } from '@/features/requests/components/request-wizard-new'
import { Button } from '@/components/ui/button'
import { ViewToggles } from '@/components/ui/view-toggles'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCancelRequest, useDeleteRequest, useReopenRequest } from '@/features/requests/hooks/use-requests'
import { cn } from '@/lib/utils'

export function BuyerHub() {
  const { t } = useTranslation(['requests/hub', 'requests/list', 'dashboard/buyer'])
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editRequestData, setEditRequestData] = useState<any>(null)
  const navigate = useNavigate()

  const { data: user } = useAuth()
  const buyerId = user?.id || ''
  const { data: requests = [], refetch, isLoading } = useBuyerRequests(buyerId)
  const { mutate: cancelRequest } = useCancelRequest()
  const { mutate: deleteRequest } = useDeleteRequest()
  const { mutate: reopenRequest } = useReopenRequest()

  const handleAction = useCallback((action: { type: string; item: any }) => {
    switch (action.type) {
      case 'view_request':
        navigate({ to: '/dashboard/requests/$requestId', params: { requestId: action.item.id } })
        break
      case 'edit_request':
        setEditRequestData(action.item)
        setIsEditDialogOpen(true)
        break
      case 'close_request':
        cancelRequest(action.item.id, {
          onSuccess: () => toast.success(t('toasts.closed', 'Request closed')),
          onError: (err: any) => toast.error(err.message || t('toasts.error')),
        })
        break
      case 'reopen_request':
        reopenRequest(action.item.id, {
          onSuccess: () => toast.success(t('toasts.reopened', 'Request reopened')),
          onError: (err: any) => toast.error(err.message || t('toasts.error')),
        })
        break
      case 'delete_request':
        deleteRequest(action.item.id, {
          onSuccess: () => toast.success(t('toasts.deleted', 'Request deleted')),
          onError: (err: any) => toast.error(err.message || t('toasts.error')),
        })
        break
    }
  }, [navigate, cancelRequest, deleteRequest, reopenRequest])

  const { activeCount, fulfilledCount, totalQuotes } = useMemo(() => {
    const active = requests.filter((r: any) => r.status === 'open').length
    const fulfilled = requests.filter((r: any) => r.status === 'fulfilled').length
    const quotes = requests.reduce((acc: number, curr: any) => acc + (curr.quotes?.length || 0), 0)
    return { activeCount: active, fulfilledCount: fulfilled, totalQuotes: quotes }
  }, [requests])

  if (isLoading || !user) {
    return <BuyerSkeleton />
  }

  const metrics = [
    { label: t('stats.active.label', { ns: 'dashboard/buyer' }), value: activeCount, icon: Zap, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: t('stats.offers.label', { ns: 'dashboard/buyer' }), value: totalQuotes, icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: t('stats.fulfilled.label', { ns: 'dashboard/buyer' }), value: fulfilledCount, icon: CheckCircle2, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  ]

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-sm uppercase shadow-lg shadow-primary/20 shrink-0">
            {(user?.name || 'U').charAt(0)}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {t('title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50"
            onClick={() => refetch()}
            title={t('buttons.refresh')}
          >
            <RefreshCcw className="size-4 text-muted-foreground" />
          </Button>
          <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
            <DialogTrigger asChild>
              <Button className="font-black uppercase text-xs tracking-widest h-11 px-6 shadow-lg shadow-primary/20 rounded-2xl w-full sm:w-auto">
                <Plus className="size-4 me-2" />
                {t('buttons.new_demand')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95dvh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
              <div className="h-[600px] max-h-[85dvh]">
                <RequestWizard
                  onSuccess={() => setIsNewRequestOpen(false)}
                  onCancel={() => setIsNewRequestOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Compact Metrics */}
      {requests.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={cn('flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all', m.color)}
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
      )}

      {/* Section header with view controls */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          {requests.length > 0 ? (
            <>
              {t('requests.title')}
              <span className="ml-2 text-muted-foreground/40 font-medium tabular-nums">{requests.length}</span>
            </>
          ) : null}
        </p>
        <ViewToggles view={view} onViewChange={setView} />
      </div>

      {/* Content */}
      {requests.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16 px-4 min-h-[300px]">
          <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-inner">
            <Plus className="size-10 text-primary/50" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-black tracking-tight">{t('empty.title', 'No Demands Yet')}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t('empty.desc', 'Start posting your part requests to get offers from sellers')}
            </p>
          </div>
          <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="font-black uppercase text-xs tracking-widest h-12 px-8 rounded-2xl shadow-lg shadow-primary/20">
                <Plus className="size-4 me-2" />
                {t('buttons.new_demand')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95dvh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
              <div className="h-[600px] max-h-[85dvh]">
                <RequestWizard onSuccess={() => setIsNewRequestOpen(false)} onCancel={() => setIsNewRequestOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : view === 'list' ? (
        <BuyerListView data={requests} onAction={handleAction} />
      ) : (
        <BuyerGridView data={requests} onAction={handleAction} />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95dvh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
          <div className="h-[600px] max-h-[85dvh]">
            <RequestWizard
              initialData={editRequestData}
              onSuccess={() => setIsEditDialogOpen(false)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
