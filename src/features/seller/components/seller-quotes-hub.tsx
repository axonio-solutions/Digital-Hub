import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SellerQuotesTable } from './seller-quotes-table'
import { SubmitQuoteForm } from '@/features/marketplace'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useDeleteQuote, useSellerQuotes } from '@/features/marketplace/hooks/use-marketplace'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowUpDown,
  Banknote,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RequestDetailsDialog } from '@/features/requests/components/request-details-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import i18n from '@/lib/i18n/config'

export function SellerQuotesHub() {
  const { t, i18n } = useTranslation(['dashboard/seller', 'dashboard/layout', 'quotes'])
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false)

  const { data: user } = useAuth()
  const sellerId = user?.id || ''

  const { data: myQuotes = [], isLoading, refetch: refetchQuotes } = useSellerQuotes(sellerId)
  const deleteQuote = useDeleteQuote()

  const handleAction = (action: { type: string, item: any }) => {
    setSelectedQuote(action.item)

    switch (action.type) {
      case 'view_request':
        setIsRequestDetailsOpen(true)
        break
      case 'update':
        setIsQuoteModalOpen(true)
        break
      case 'delete':
        if (confirm(t('hub.confirm.withdraw'))) {
          deleteQuote.mutate(action.item.id, {
            onSuccess: () => {
              toast.success(t('hub.toasts.withdrawn'))
              refetchQuotes()
            }
          })
        }
        break
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 animate-in fade-in duration-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-4">{t('hub.loading')}</p>
        </div>
      </div>
    )
  }

  const wonQuotes = myQuotes.filter((q: any) => q.status === 'accepted')
  const pendingQuotes = myQuotes.filter((q: any) => q.status === 'pending')
  const lostQuotes = myQuotes.filter(
    (q: any) =>
      q.status === 'rejected' ||
      (q.request?.status === 'fulfilled' && q.status !== 'accepted'),
  )

  const pipelineValue = pendingQuotes.reduce((acc: number, q: any) => acc + (q.price || 0), 0)
  const successRate = myQuotes.length > 0 ? Math.round((wonQuotes.length / myQuotes.length) * 100) : 0

  return (
    <div className="flex-1 space-y-10 p-6 md:p-10 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto w-full pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-900">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            {t('hub.title')}
          </h2>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
               {t('hub.desc')}
             </span>
             <span className="h-[1px] w-12 bg-primary/20" />
          </div>
        </div>
      </div>

      {/* Stats Pipeline - Refined Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 backdrop-blur-sm rounded-2xl group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowUpDown className="size-12 rotate-45" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[9px]">{t('hub.stats.total')}</CardDescription>
            <CardTitle className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">
              {myQuotes.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
             <p className="text-[10px] font-bold text-slate-500 uppercase">{t('hub.stats.total_sub')}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 backdrop-blur-sm rounded-2xl group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="size-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[9px]">{t('hub.stats.success_rate')}</CardDescription>
            <CardTitle className="text-3xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
              {successRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
             <p className="text-[10px] font-bold text-slate-500 uppercase">{t('hub.stats.success_rate_sub')}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 backdrop-blur-sm rounded-2xl group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Banknote className="size-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[9px]">{t('hub.stats.pipeline')}</CardDescription>
            <CardTitle className="text-3xl font-black tabular-nums text-blue-600 dark:text-blue-400">
              {pipelineValue.toLocaleString(i18n.language)} <span className="text-xs font-normal text-muted-foreground">{t('currency')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
             <p className="text-[10px] font-bold text-slate-500 uppercase">{t('hub.stats.pipeline_sub')}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 backdrop-blur-sm rounded-2xl group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="size-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="dark:text-slate-400 font-bold uppercase tracking-widest text-[9px]">{t('hub.stats.accepted_count')}</CardDescription>
            <CardTitle className="text-3xl font-black tabular-nums text-purple-600 dark:text-purple-400">
              {wonQuotes.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
             <p className="text-[10px] font-bold text-slate-500 uppercase">{t('hub.stats.accepted_sub')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-8 mt-4" dir={i18n.dir()}>
        <div className="flex items-center justify-between">
          <TabsList className="h-11 bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-xl backdrop-blur-md border border-slate-200 dark:border-slate-800">
            <TabsTrigger value="active" className="rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
              {t('hub.tabs.active')} <Badge variant="secondary" className="ml-2 h-4 px-1.5 min-w-4 flex items-center justify-center rounded-md font-black text-[9px]">{pendingQuotes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="won" className="rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
              {t('hub.tabs.won')} <Badge variant="secondary" className="ml-2 h-4 px-1.5 min-w-4 flex items-center justify-center rounded-md font-black text-[9px]">{wonQuotes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="lost" className="rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
              {t('hub.tabs.lost')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-0 ring-offset-background focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
           <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-950/20 rounded-[2rem] overflow-hidden">
             <SellerQuotesTable data={pendingQuotes} onAction={handleAction} />
           </Card>
        </TabsContent>

        <TabsContent value="won" className="mt-0 ring-offset-background focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
           <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-950/20 rounded-[2rem] overflow-hidden">
             <SellerQuotesTable data={wonQuotes} onAction={handleAction} />
           </Card>
        </TabsContent>

        <TabsContent value="lost" className="mt-0 ring-offset-background focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
           <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-950/20 rounded-[2rem] overflow-hidden">
             <SellerQuotesTable data={lostQuotes} onAction={handleAction} />
           </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('hub.dialog.update_title')}</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {t('hub.dialog.update_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {selectedQuote && user && (
              <SubmitQuoteForm
                quoteId={selectedQuote.id}
                requestId={selectedQuote.requestId}
                sellerId={user.id}
                requestImages={selectedQuote.request?.imageUrls || []}
                vehicleInfo={{
                  brand: selectedQuote.request?.vehicleBrand || t('unknown', { ns: 'dashboard/layout' }),
                  model: selectedQuote.request?.vehicleModel || t('unknown', { ns: 'dashboard/layout' }),
                  year: selectedQuote.request?.modelYear || t('unknown', { ns: 'dashboard/layout' })
                }}
                category={selectedQuote.request?.category?.name || selectedQuote.request?.category}
                oemNumber={selectedQuote.request?.oemNumber}
                notes={selectedQuote.request?.notes}
                initialData={{
                  price: selectedQuote.price,
                  condition: selectedQuote.condition,
                  warranty: selectedQuote.warranty
                }}
                onSuccess={() => {
                  setIsQuoteModalOpen(false)
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
        request={selectedQuote?.request}
        footer={
          <div className="pt-6 flex gap-4 w-full">
            {selectedQuote?.status !== 'accepted' && (
              <Button
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                onClick={() => { setIsRequestDetailsOpen(false); setIsQuoteModalOpen(true); }}
              >
                {t('hub.dialog.update_btn')}
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
