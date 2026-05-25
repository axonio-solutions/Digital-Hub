'use client'

import { Suspense, lazy, useState } from 'react'
import { FileText, Loader2, ShoppingBag, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAnonymousQuotes } from '../hooks/use-marketplace'
import { RequestDetailsTab } from './request-details-tab'
import { OfferTab } from './offer-tab'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SubmitOfferTabLazy = lazy(() =>
  import('./submit-offer-tab').then((m) => ({
    default: m.SubmitOfferTab,
  })),
)

interface OfferModalTabsProps {
  request: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

type EditData = {
  id: string
  price: number
  condition: string
  warranty: string | null
}

export function OfferModalTabs({
  request,
  isOpen,
  onOpenChange,
  user,
}: OfferModalTabsProps) {
  const { i18n } = useTranslation('marketplace')
  const isRtl = i18n.dir() === 'rtl'
  const [tabValue, setTabValue] = useState('request-details')
  const [editData, setEditData] = useState<EditData | null>(null)

  const { data: anonymousQuotes, isLoading: quotesLoading } =
    useAnonymousQuotes(isOpen ? request?.id : undefined)

  if (!request) return null

  const handleEditOffer = (quote: any) => {
    setEditData({
      id: quote.id,
      price: quote.price,
      condition: quote.condition,
      warranty: quote.warranty,
    })
    setTabValue('submit-offer')
  }

  const handleTabChange = (value: string) => {
    setTabValue(value)
    if (value !== 'submit-offer') {
      setEditData(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir={isRtl ? 'rtl' : 'ltr'}
        className={cn(
          'sm:max-w-4xl w-[95vw]',
          'max-h-[90dvh] h-[680px] p-0 flex flex-col gap-0 overflow-hidden',
          'rounded-xl border border-border/30 bg-card',
          'shadow-[0_8px_32px_-8px_rgba(15,23,42,0.08)]',
        )}
      >
        <div className="shrink-0 px-6 py-4 border-b border-border/40 bg-gradient-to-br from-primary/[0.03] to-blue-50/30">
          <div className="flex justify-between items-start gap-4">
            <div>
              <DialogHeader className="p-0">
                <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                  Send Your Offer
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground/70 mt-0.5">
                  Review request details and market trends before submitting
                  your quote.
                </DialogDescription>
              </DialogHeader>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground/40 hover:text-foreground shrink-0 cursor-pointer transition-colors duration-150 -mr-1.5 -mt-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs
          value={tabValue}
          onValueChange={handleTabChange}
          className="flex flex-col flex-1 min-h-0"
        >
          <TabsList className="shrink-0 w-full justify-start px-6 py-0 h-auto bg-transparent border-b border-border/40 rounded-none gap-0">
            <TabsTrigger
              value="request-details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F172A] data-[state=active]:bg-transparent px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 data-[state=active]:text-[#0F172A] transition-all duration-150 cursor-pointer"
            >
              <FileText className="w-3 h-3 mr-1.5 shrink-0" />
              Request Details
            </TabsTrigger>
            <TabsTrigger
              value="offer"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F172A] data-[state=active]:bg-transparent px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 data-[state=active]:text-[#0F172A] transition-all duration-150 cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3 mr-1.5 shrink-0" />
              Offer
            </TabsTrigger>
            <TabsTrigger
              value="submit-offer"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F172A] data-[state=active]:bg-transparent px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 data-[state=active]:text-[#0F172A] transition-all duration-150 cursor-pointer"
            >
              Submit Your Offer
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="request-details" className="p-0 mt-0">
              <RequestDetailsTab request={request} />
            </TabsContent>
            <TabsContent value="offer" className="p-0 mt-0">
              <OfferTab
                quotes={anonymousQuotes || []}
                isLoading={quotesLoading}
                currentSellerId={user?.id}
                onEditOffer={handleEditOffer}
              />
            </TabsContent>
            <TabsContent value="submit-offer" className="p-0 mt-0">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
                  </div>
                }
              >
                <SubmitOfferTabLazy
                  requestId={request.id}
                  sellerId={user?.id || ''}
                  onSuccess={() => onOpenChange(false)}
                  editData={editData}
                />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
