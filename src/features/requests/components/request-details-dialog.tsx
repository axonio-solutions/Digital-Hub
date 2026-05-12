'use client'

import { useTranslation } from 'react-i18next'
import { Calendar, Car, Hash, MapPin, MessageSquare, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ImageSlider } from '@/components/ui/image-slider'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { tCategory } from '@/utils/category-utils'

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

export function RequestDetailsDialog({ request, quote, isOpen, onOpenChange, footer }: RequestDetailsDialogProps) {
  const { t } = useTranslation('requests/details')
  if (!request) return null

  const quotesCount = request?.quotes?.length || 0
  const hasQuote = !!quote

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[480px] max-h-[92vh] overflow-y-auto rounded-2xl p-0 gap-0 border-0">
        <DialogTitle className="sr-only">{request?.partName || t('title')}</DialogTitle>

        {/* Image */}
        <ImageSlider images={request?.imageUrls || []} aspectRatio="video" className="w-full rounded-t-2xl" />

        <div className="p-4 sm:p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <h2 className="text-base font-black uppercase tracking-tight leading-snug text-slate-900 dark:text-white">
              {request?.partName}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-primary uppercase">
                {tCategory(request?.category?.name || request?.category, t)}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono font-medium">
                #{request?.id?.substring(0, 8)}
              </span>
            </div>
          </div>

          {/* Your Offer Section */}
          {hasQuote && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="size-3.5 text-primary" />
                <span className="text-[11px] font-black text-primary uppercase tracking-wider">Your Offer</span>
                <GlowingBadge
                  variant={STATUS_VARIANT[quote.status] || 'info'}
                  pulse={quote.status === 'pending'}
                  className="ml-auto"
                >
                  {t(`columns.statuses.${quote.status}`, { ns: 'quotes', defaultValue: quote.status })}
                </GlowingBadge>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Price</p>
                  <p className="text-sm font-bold tabular-nums">
                    {(quote.price || 0).toLocaleString()} DZD
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Condition</p>
                  <p className="text-sm font-bold capitalize">{quote.condition || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Warranty</p>
                  <p className="text-sm font-bold">{quote.warranty || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Submitted</p>
                  <p className="text-sm font-bold">
                    {quote.createdAt ? format(new Date(quote.createdAt), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle & OEM */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
              <Car className="size-3.5 text-slate-400 dark:text-slate-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight">
                  {request?.vehicleBrand} {request?.vehicleModel}
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">{request?.modelYear}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
              <Hash className="size-3.5 text-slate-400 dark:text-slate-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight">OEM</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5 truncate">
                  {request?.oemNumber || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {request?.notes && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-3">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                Buyer Notes
              </p>
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200/80 italic">
                "{request.notes}"
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {request?.wilaya || 'Algeria'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {request?.createdAt ? format(new Date(request.createdAt), 'MMM d') : '—'}
            </span>
            <span className="flex items-center gap-1 font-bold tabular-nums">
              <MessageSquare className="size-3" />
              {quotesCount}
            </span>
          </div>

          {/* Footer Actions */}
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  )
}
