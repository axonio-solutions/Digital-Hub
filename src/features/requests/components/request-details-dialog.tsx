'use client'

import { useTranslation } from 'react-i18next'
import {
  BadgeCheck,
  Calendar,
  Car,
  FileText,
  Hash,
  Info,
  MapPin,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { formatRelativeTime } from '@/lib/utils/date-format'
import { ImageSlider } from '@/components/ui/image-slider'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { tCategory } from '@/utils/category-utils'
import { CategoryDisplay } from '@/components/ui/category-display'

interface RequestDetailsDialogProps {
  request: any | null
  quote?: any | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  footer?: React.ReactNode
}

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'neutral'> = {
  accepted: 'success',
  pending: 'info',
  rejected: 'neutral',
}

export function RequestDetailsDialog({
  request,
  quote,
  isOpen,
  onOpenChange,
  footer,
}: RequestDetailsDialogProps) {
  const { t } = useTranslation('requests/details')
  if (!request) return null

  const quotesCount = request?.quotes?.length || 0
  const hasQuote = !!quote

  const offerContent = (
    <div className="space-y-5">
      {/* Price Hero */}
      <div className="text-center py-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
          {t('offer_details.price', {
            ns: 'marketplace',
            defaultValue: 'Offered Price',
          })}
        </p>
        <p className="text-3xl sm:text-4xl font-black tabular-nums text-foreground">
          {(quote?.price || 0).toLocaleString()}{' '}
          <span className="text-base font-bold text-muted-foreground">
            {t('columns.currency', { ns: 'quotes' })}
          </span>
        </p>
      </div>

      {/* Status */}
      {hasQuote && (
        <div className="flex justify-center">
          <GlowingBadge
            variant={STATUS_VARIANT[quote.status] || 'info'}
            pulse={quote.status === 'pending'}
            className="text-xs font-black uppercase tracking-wider px-4 py-1.5"
          >
            {t(`columns.statuses.${quote.status}`, {
              ns: 'quotes',
              defaultValue: quote.status,
            })}
          </GlowingBadge>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            <BadgeCheck className="w-3 h-3" /> {t('offer_details.condition')}
          </div>
          <p className="text-sm font-bold capitalize">
            {quote?.condition
              ? t(`columns.conditions.${quote.condition}`, {
                  ns: 'quotes',
                  defaultValue: quote.condition,
                })
              : '—'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            <FileText className="w-3 h-3" /> {t('offer_details.warranty')}
          </div>
          <p className="text-sm font-bold">
            {quote?.warranty || t('offer_details.no_warranty')}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            <Calendar className="w-3 h-3" /> {t('offer_details.submitted')}
          </div>
          <p className="text-sm font-bold">
            {quote?.createdAt ? formatRelativeTime(quote.createdAt) : '—'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            <Info className="w-3 h-3" /> {t('offer_details.part')}
          </div>
          <p className="text-sm font-bold truncate">
            {request?.partName || '—'}
          </p>
        </div>
      </div>
    </div>
  )

  const requestContent = (
    <div className="space-y-4">
      <ImageSlider
        images={request?.imageUrls || []}
        aspectRatio="4/3"
        className="rounded-xl"
      />

      <div className="space-y-1">
        <h2 className="text-lg font-black uppercase tracking-tight leading-snug text-foreground">
          {request?.partName}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-primary uppercase inline-flex items-center gap-1">
            <CategoryDisplay
              category={request?.category}
              showName={false}
              iconClassName="size-3.5"
            />
            {tCategory(request?.category?.name || request?.category, t)}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono font-medium">
            #{request?.id?.substring(0, 8)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            <Car className="w-3 h-3" /> {t('offer_details.vehicle')}
          </div>
          <p className="text-sm font-bold text-foreground leading-tight">
            {request?.vehicleBrand} {request?.vehicleModel}
          </p>
          <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
            {request?.modelYear}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            <Hash className="w-3 h-3" /> {t('offer_details.oem')}
          </div>
          <p className="text-sm font-bold text-foreground font-mono truncate">
            {request?.oemNumber || '—'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border col-span-2">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            <MapPin className="w-3 h-3" /> {t('offer_details.location')}
          </div>
          <p className="text-sm font-bold text-foreground">
            {request?.wilaya || t('offer_details.algeria')}
          </p>
        </div>
      </div>

      {request?.notes && (
        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
          <div className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
            {t('offer_details.buyer_notes')}
          </div>
          <p className="text-xs italic leading-relaxed text-amber-800 dark:text-amber-200/80">
            &ldquo;{request.notes}&rdquo;
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-2 border-t border-border">
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {request?.createdAt ? formatRelativeTime(request.createdAt) : '—'}
        </span>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full max-w-full sm:w-[95vw] max-h-[95vh] p-0 border-0 rounded-2xl shadow-2xl bg-card overflow-y-auto lg:overflow-hidden">
        {/* Mobile: Tabbed Interface */}
        <div className="lg:hidden flex flex-col h-full min-h-0">
          <Tabs
            defaultValue={hasQuote ? 'offer' : 'request'}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="sticky top-0 z-20 bg-card border-b border-border/60">
              <TabsList className="w-full grid grid-cols-2 h-12 bg-muted/50 rounded-none p-1 gap-1.5">
                <TabsTrigger
                  value="offer"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200"
                >
                  <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('offer_details.your_offer')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="request"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('offer_details.request_tab')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="offer"
              className="flex-1 overflow-y-auto p-4 sm:p-5 mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex-col"
            >
              {offerContent}
            </TabsContent>

            <TabsContent
              value="request"
              className="flex-1 overflow-y-auto p-4 sm:p-5 mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex-col"
            >
              {requestContent}
            </TabsContent>
          </Tabs>

          {footer && (
            <div className="sticky bottom-0 bg-card border-t border-border/60 p-4">
              {footer}
            </div>
          )}
        </div>

        {/* Desktop: Side-by-side Layout */}
        <div className="hidden lg:flex lg:h-full">
          <div className="w-1/2 bg-muted/30 p-6 lg:p-8 overflow-y-auto border-r border-border">
            {requestContent}
          </div>
          <div className="w-1/2 p-6 lg:p-8 overflow-y-auto flex flex-col justify-between bg-card">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                {t('offer_details.title', {
                  ns: 'marketplace',
                  defaultValue: 'Your Offer Details',
                })}
              </p>
              {offerContent}
            </div>
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
