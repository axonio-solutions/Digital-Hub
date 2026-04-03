import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SubmitQuoteForm } from './submit-quote-form'
import { MarketplaceDataTable } from './marketplace-data-table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useOpenRequests } from '@/features/requests/hooks/use-requests'
import { useDeleteQuote, useSellerQuotes } from '@/features/marketplace/hooks/use-marketplace'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCcw, Sparkles, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DashboardHeader } from "@/components/ui/dashboard-header"
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { RequestDetailsDialog } from '@/features/requests/components/request-details-dialog'
import { useSellerSpecialties, useToggleViewMode } from '@/features/vendors/hooks/use-vendors'

export function MarketplaceHub() {
  const { t, i18n } = useTranslation('marketplace')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false)
  const [isOfferDetailsOpen, setIsOfferDetailsOpen] = useState(false)

  // Data Fetching
  const { data: user } = useAuth()
  const sellerId = user?.id || ''
  const { data: specialties, isLoading: loadingSpecialties } = useSellerSpecialties()
  const toggleViewMode = useToggleViewMode()

  const openRequestsFilters = useMemo(() => {
    // If viewModeGeneralBroadcast is false, it means filtering is ACTIVE
    const isFilteringActive = user?.viewModeGeneralBroadcast === false && (
      (specialties?.brands && specialties.brands.length > 0) || 
      (specialties?.categories && specialties.categories.length > 0)
    )

    if (!isFilteringActive) return undefined
    
    return {
      specialtyFilter: {
        brandIds: specialties?.brands || [],
        categoryIds: specialties?.categories || [],
      }
    }
  }, [user?.viewModeGeneralBroadcast, specialties])

  const { data: openRequests = [], isLoading: loadingRequests, refetch } =
    useOpenRequests(openRequestsFilters)
    
  const { data: myQuotes = [], isLoading: loadingQuotes, refetch: refetchQuotes } =
    useSellerQuotes(sellerId)

  const deleteQuote = useDeleteQuote()

  // Prepare data for the table
  const openOpportunities = useMemo(() => {
    return openRequests
      .filter((req: any) => !myQuotes.some((q: any) => q.requestId === req.id))
      .filter((req: any) => req.buyerId !== user?.id)
  }, [openRequests, myQuotes, user?.id])

  const activeOpportunities = useMemo(() => {
    return myQuotes.map((q: any) => ({
      ...q.request,
      quoteId: q.id,
      quotePrice: q.price,
      quoteStatus: q.status,
      quoteCondition: q.condition,
      quoteWarranty: q.warranty,
      id: q.request?.id || '',
      sellerId: q.sellerId,
      requestId: q.requestId,
      originalQuote: q
    }))
  }, [myQuotes])

  const handleAction = (action: { type: string, item: any }) => {
    setSelectedRequest(action.item)
    
    switch (action.type) {
      case 'send_offer':
      case 'update':
        setIsQuoteModalOpen(true)
        break
      case 'view_request':
        setIsRequestDetailsOpen(true)
        break
      case 'view_offer':
        setIsOfferDetailsOpen(true)
        break
      case 'delete':
        if (confirm(t('alerts.delete_confirm'))) {
          deleteQuote.mutate(action.item.quoteId, {
            onSuccess: () => {
              toast.success(t('toasts.delete_success'))
              refetch()
              refetchQuotes()
            }
          })
        }
        break
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-text-main-dark transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        <DashboardHeader 
          title={t('hub.title')} 
          description={t('hub.description')} 
          showDate={false}
          actions={
            <Button 
              variant="outline" 
              className="h-11 px-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm font-bold border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-95"
              onClick={() => refetch()}
            >
              <RefreshCcw className={cn("me-2 size-4", loadingRequests && "animate-spin")} /> {t('hub.refresh')}
            </Button>
          }
          className="mb-12"
        />

        {/* 1. Missing Specialties Banner (Priority) */}
        {!loadingSpecialties && (specialties?.brands?.length || 0) === 0 && (specialties?.categories?.length || 0) === 0 && (
          <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/20 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 size-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/30 shrink-0">
                  <SlidersHorizontal className="size-8 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">{t('specialties_banner.complete_title')}</h3>
                  <p className="text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
                    {t('specialties_banner.complete_desc')}
                  </p>
                </div>
              </div>
              <Button 
                asChild
                className="rounded-2xl px-8 h-12 font-bold bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
              >
                <Link to="/dashboard/profile" hash="specialties">
                  {t('specialties_banner.complete_btn')}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* 2. Toggle Activation Banner (Shown only if specialties exist but toggle is OFF) */}
        {user?.viewModeGeneralBroadcast && ((specialties?.brands?.length || 0) > 0 || (specialties?.categories?.length || 0) > 0) && (
          <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 size-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
                  <Sparkles className="size-8 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">{t('specialties_banner.ready_title')}</h3>
                  <p className="text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
                    {t('specialties_banner.ready_desc')}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => toggleViewMode.mutate(false)}
                className="rounded-2xl px-8 h-12 font-bold bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
              >
                {t('specialties_banner.ready_btn')}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8">
          <main className="flex flex-col gap-6">
            <Tabs defaultValue="open" className="w-full">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="open" className="font-bold uppercase tracking-wider text-[10px]">
                    {t('tabs.open')} ({loadingRequests || loadingQuotes ? '...' : new Intl.NumberFormat(i18n.language).format(openOpportunities.length)})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="font-bold uppercase tracking-wider text-[10px]">
                    {t('tabs.active')} ({loadingRequests || loadingQuotes ? '...' : new Intl.NumberFormat(i18n.language).format(activeOpportunities.length)})
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                  <SlidersHorizontal className="size-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('hub.filter_specialties')}</span>
                  <div 
                    onClick={() => toggleViewMode.mutate(!user?.viewModeGeneralBroadcast)}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                      !user?.viewModeGeneralBroadcast ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 size-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                      !user?.viewModeGeneralBroadcast ? "translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                </div>
              </div>

              <div className="mt-2 focus-visible:ring-0">
                <TabsContent value="open" className="mt-0 focus-visible:ring-0">
                  {loadingRequests || loadingQuotes ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800" />
                      ))}
                    </div>
                  ) : (
                    <MarketplaceDataTable
                      data={openOpportunities}
                      onAction={handleAction}
                      type="opportunity"
                    />
                  )}
                </TabsContent>
                <TabsContent value="active" className="mt-0 focus-visible:ring-0">
                  {loadingRequests || loadingQuotes ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800" />
                      ))}
                    </div>
                  ) : (
                    <MarketplaceDataTable
                      data={activeOpportunities}
                      onAction={handleAction}
                      type="active"
                    />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </main>
        </div>
      </div>

      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('form.submit_btn')}</DialogTitle>
            <DialogDescription>
              {t('form.offer_desc')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedRequest && user && (
              <SubmitQuoteForm
                quoteId={selectedRequest.quoteId}
                requestId={selectedRequest.requestId || selectedRequest.id}
                sellerId={user.id}
                requestImages={selectedRequest.imageUrls || []}
                vehicleInfo={{
                  brand: selectedRequest.vehicleBrand || t('defaults.unknown'),
                  model: selectedRequest.vehicleModel || t('defaults.unknown'),
                  year: selectedRequest.modelYear || t('defaults.unknown')
                }}
                category={selectedRequest.category?.name || selectedRequest.category}
                oemNumber={selectedRequest.oemNumber}
                notes={selectedRequest.notes}
                initialData={selectedRequest.quoteId ? {
                  price: selectedRequest.quotePrice,
                  condition: selectedRequest.quoteCondition,
                  warranty: selectedRequest.quoteWarranty
                } : undefined}
                onSuccess={() => {
                  setIsQuoteModalOpen(false)
                  refetch() 
                  refetchQuotes()
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RequestDetailsDialog
        isOpen={isRequestDetailsOpen}
        onOpenChange={setIsRequestDetailsOpen}
        request={selectedRequest}
        footer={
          <div className="pt-4 flex gap-3">
            <Button 
               className="flex-1"
               onClick={() => { setIsRequestDetailsOpen(false); setIsQuoteModalOpen(true); }} 
            >
              {selectedRequest?.quoteId ? t('form.update_btn') : t('form.send_offer')}
            </Button>
            {selectedRequest?.quoteId && (
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => { setIsRequestDetailsOpen(false); handleAction({ type: 'delete', item: selectedRequest }); }} 
              >
                {t('table.actions.withdraw')}
              </Button>
            )}
            <Button 
               variant="secondary" 
               className={cn("flex-1", selectedRequest?.quoteId ? "hidden sm:inline-flex" : "")}
               onClick={() => setIsRequestDetailsOpen(false)} 
            >
              {t('close')}
            </Button>
          </div>
        }
      />

      <Dialog open={isOfferDetailsOpen} onOpenChange={setIsOfferDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('offer_details.title')}</DialogTitle>
            <DialogDescription>
              {t('offer_details.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
             <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border bg-muted/50 text-center space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('offer_details.price')}</div>
                <div className="text-2xl font-black text-primary">
                  {new Intl.NumberFormat(i18n.language).format(selectedRequest?.quotePrice)} <span className="text-sm font-black opacity-60">DZD</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl border bg-muted/50 text-center space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('offer_details.condition')}</div>
                <div className="text-xl font-bold uppercase">{selectedRequest?.quoteCondition === 'new' ? t('form.condition_new') : t('form.condition_used')}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-slate-50 italic text-sm text-center">
              {selectedRequest?.quoteWarranty || t('offer_details.no_warranty')}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1"
                onClick={() => { setIsOfferDetailsOpen(false); handleAction({ type: 'update', item: selectedRequest }); }} 
              >
                {t('offer_details.adjust_btn')}
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => { setIsOfferDetailsOpen(false); handleAction({ type: 'delete', item: selectedRequest }); }} 
              >
                {t('offer_details.delete_btn')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
