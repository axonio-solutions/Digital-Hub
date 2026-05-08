'use client'

import { useCallback, useState } from 'react'
import { Plus, RefreshCcw } from 'lucide-react'
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

export function BuyerHub() {
  const { t } = useTranslation('requests/hub')
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
        navigate({
          to: '/dashboard/requests/$requestId',
          params: { requestId: action.item.id },
        })
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
  }, [navigate, cancelRequest, deleteRequest, reopenRequest, t, setIsEditDialogOpen, setEditRequestData])

  if (isLoading || !user) {
    return <BuyerSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col gap-4 w-full pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {t('description')}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <ViewToggles view={view} onViewChange={setView} />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-9 bg-card shadow-sm font-bold hover:bg-accent transition-colors border-border rounded-xl sm:w-auto sm:px-3"
            onClick={() => refetch()}
            title={t('buttons.refresh')}
          >
            <RefreshCcw className="size-3.5 sm:me-1.5" />
            <span className="hidden sm:inline text-xs font-bold">{t('buttons.refresh')}</span>
          </Button>

          <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
            <DialogTrigger asChild>
              <Button className="font-black uppercase text-xs tracking-widest h-9 px-4 shadow-lg shadow-primary/20 rounded-xl sm:px-5 sm:h-10">
                <Plus className="size-4 sm:me-1.5" />
                <span className="hidden sm:inline">{t('buttons.new_demand')}</span>
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

      <div className="min-w-0">
        {view === 'list' ? (
          <BuyerListView data={requests} onAction={handleAction} />
        ) : (
          <BuyerGridView data={requests} onAction={handleAction} />
        )}
      </div>

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
