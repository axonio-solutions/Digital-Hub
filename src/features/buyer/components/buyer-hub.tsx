'use client'

import { useState } from 'react'
import {
  RefreshCcw,
  Plus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BuyerListView } from './buyer-list-view'
import { BuyerGridView } from './buyer-grid-view'
import { useNavigate } from '@tanstack/react-router'
import { NewPartRequestForm } from '@/features/requests/components/new-request-form'
import { BuyerSkeleton } from './buyer-skeleton'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { ViewToggles } from "@/components/ui/view-toggles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'

// Hooks
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useBuyerRequests } from '../hooks/use-buyer'

export function BuyerHub() {
  const { t } = useTranslation('requests/hub')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const navigate = useNavigate()

  // Data Fetching
  const { data: user } = useAuth()
  const buyerId = user?.id || ''
  const { data: requests = [], refetch, isLoading } = useBuyerRequests(buyerId)

  const handleAction = (action: { type: string, item: any }) => {
    if (action.type === 'view_request') {
      navigate({ 
        to: '/dashboard/requests/$requestId', 
        params: { requestId: action.item.id } 
      })
    }
  }

  if (isLoading || !user) {
    return <BuyerSkeleton />
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="layout-container flex justify-center w-full py-2 px-2 sm:px-4 lg:px-6">
        <div className="flex w-full max-w-6xl flex-col gap-6 pt-4">
          <DashboardHeader 
            title={t('title')} 
            description={t('description')} 
            showDate={false}
            actions={
              <div className="flex items-center gap-2">
                <ViewToggles view={view} onViewChange={setView} />

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 bg-white dark:bg-slate-950 shadow-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-slate-200 dark:border-slate-800"
                  onClick={() => refetch()}
                >
                  <RefreshCcw className="me-2 size-3.5" /> {t('buttons.refresh')}
                </Button>

                <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                  <DialogTrigger asChild>
                    <Button className="font-black uppercase text-xs tracking-widest px-6 h-11 shadow-lg shadow-primary/20">
                      <Plus className="me-2 h-4 w-4" />
                      {t('buttons.new_demand')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
                    <div className="p-8">
                      <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold">
                          {t('dialog.title')}
                        </DialogTitle>
                        <DialogDescription>
                          {t('dialog.description')}
                        </DialogDescription>
                      </DialogHeader>
                      <NewPartRequestForm
                        onSuccess={() => setIsNewRequestOpen(false)}
                        onCancel={() => setIsNewRequestOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            }
          />

          <div className="min-w-0">
            {view === 'list' ? (
              <BuyerListView data={requests} onAction={handleAction} />
            ) : (
              <BuyerGridView data={requests} onAction={handleAction} />
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

