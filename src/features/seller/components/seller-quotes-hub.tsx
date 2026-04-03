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

export function SellerQuotesHub() {
  const { t } = useTranslation('quotes')
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
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('hub.loading')}</p>
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('hub.title')}</h2>
          <p className="text-muted-foreground">
            {t('hub.desc')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hub.stats.total')}</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myQuotes.length}</div>
            <p className="text-xs text-muted-foreground">{t('hub.stats.total_sub')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hub.stats.success_rate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">{t('hub.stats.success_rate_sub')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hub.stats.pipeline')}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('hub.stats.pipeline_sub')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hub.stats.accepted')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wonQuotes.length}</div>
            <p className="text-xs text-muted-foreground">{t('hub.stats.accepted_sub')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            {t('hub.tabs.active')} ({pendingQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="won">
            {t('hub.tabs.won')} ({wonQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="lost">
            {t('hub.tabs.lost')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0 outline-none">
          <SellerQuotesTable data={pendingQuotes} onAction={handleAction} />
        </TabsContent>

        <TabsContent value="won" className="mt-0 outline-none">
          <SellerQuotesTable data={wonQuotes} onAction={handleAction} />
        </TabsContent>

        <TabsContent value="lost" className="mt-0 outline-none">
          <SellerQuotesTable data={lostQuotes} onAction={handleAction} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('hub.dialog.update_title')}</DialogTitle>
            <DialogDescription>
              {t('hub.dialog.update_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedQuote && user && (
              <SubmitQuoteForm
                quoteId={selectedQuote.id}
                requestId={selectedQuote.requestId}
                sellerId={user.id}
                requestImages={selectedQuote.request?.imageUrls || []}
                vehicleInfo={{
                  brand: selectedQuote.request?.vehicleBrand || 'Unknown',
                  model: selectedQuote.request?.vehicleModel || 'Unknown',
                  year: selectedQuote.request?.modelYear || 'Unknown'
                }}
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
          <div className="pt-4 flex gap-3">
            {selectedQuote?.status !== 'accepted' && (
              <Button
                className="flex-1"
                onClick={() => { setIsRequestDetailsOpen(false); setIsQuoteModalOpen(true); }}
              >
                {t('hub.dialog.update_btn')}
              </Button>
            )}
            <Button
              variant="secondary"
              className="flex-1"
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
