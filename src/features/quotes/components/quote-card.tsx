'use client'

import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Phone,
  RotateCcw,
  Undo2,
  XCircle,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/date-format'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuoteCardProps {
  quote: any
  isRequestOpen: boolean
  onAccept: (quoteId: string) => void
  onReject: (quoteId: string) => void
  onUnreject: (quoteId: string) => void
  onRevoke: (quoteId: string) => void
  onContact: (seller: any) => void
  isAccepting?: boolean
  isRejecting?: boolean
  isUnrejecting?: boolean
  isRevoking?: boolean
}

export function QuoteCard({
  quote,
  isRequestOpen,
  onAccept,
  onReject,
  onUnreject,
  onRevoke,
  onContact,
  isAccepting = false,
  isRejecting = false,
  isUnrejecting = false,
  isRevoking = false,
}: QuoteCardProps) {
  const { t } = useTranslation('quotes')
  const isAccepted = quote.status === 'accepted'
  const isRejected = quote.status === 'rejected'
  const isPending = !quote.status || quote.status === 'pending'
  const sellerName = quote.seller?.storeName || quote.seller?.name || t('card.authorized_seller')
  const sellerInitial = sellerName[0]?.toUpperCase() || 'S'

  return (
    <div className={cn(
      'rounded-2xl p-4 sm:p-5 border shadow-sm',
      isAccepted && 'border-primary/40 bg-primary/[0.03]',
      isRejected && 'opacity-50 border-border bg-muted/20',
      isPending && 'border-border bg-card hover:border-primary/20'
    )}>
      {/* Top row: Avatar + Name + Price */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={cn(
          'size-10 sm:size-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg shrink-0 border',
          isAccepted
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-primary/10 text-primary border-primary/20'
        )}>
          {sellerInitial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight truncate">
              {sellerName}
            </h3>
            {isAccepted && <CheckCircle2 className="size-4 text-primary shrink-0" />}
            {isRejected && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {t('card.rejected', 'Rejected')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeTime(quote.createdAt)}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate max-w-[120px]">
                {quote.seller?.wilaya || quote.seller?.city || quote.seller?.address || t('card.default_location')}
              </span>
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className={cn(
            'text-lg sm:text-xl font-black tracking-tight',
            isAccepted ? 'text-primary' : 'text-foreground'
          )}>
            {quote.price.toLocaleString()}
            <span className="text-[10px] font-bold text-muted-foreground ml-0.5">{t('columns.currency')}</span>
          </p>
          <span className="inline-block mt-0.5 text-[10px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
            {quote.condition ? t(`columns.conditions.${quote.condition}`, { defaultValue: quote.condition }) : t('columns.conditions.used')}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className={cn(
        'mt-3 rounded-xl p-3 sm:p-4 border',
        isAccepted ? 'bg-primary/5 border-primary/10' : 'bg-muted/30 border-border/50'
      )}>
        <p className="text-sm text-foreground/80 italic leading-relaxed">
          "{quote.notes || t('card.default_note', 'No additional notes.')}"
        </p>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 flex-wrap sm:justify-end">
        {isAccepted ? (
          <>
            <Button
              onClick={() => onRevoke(quote.id)}
              disabled={isRevoking}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none h-10 rounded-xl gap-2 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50"
            >
              {isRevoking ? <Loader2 className="size-3.5 animate-spin" /> : <Undo2 className="size-3.5" />}
              {isRevoking ? t('card.actions.revoking') : t('card.actions.revoke')}
            </Button>
            <Button
              onClick={() => onContact(quote.seller)}
              size="sm"
              className="flex-1 sm:flex-none h-10 rounded-xl gap-2 text-xs font-bold shadow-sm"
            >
              <Phone className="size-3.5" />
              {t('card.actions.contact')}
            </Button>
          </>
        ) : isRejected ? (
          <Button
            onClick={() => onUnreject(quote.id)}
            disabled={isUnrejecting}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-10 rounded-xl gap-2 text-xs font-bold"
          >
            {isUnrejecting ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
            {isUnrejecting ? t('card.actions.unrejecting') : t('card.actions.unreject')}
          </Button>
        ) : isPending && isRequestOpen ? (
          <>
            <Button
              onClick={() => onReject(quote.id)}
              disabled={isRejecting}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none h-10 rounded-xl gap-2 text-xs font-bold"
            >
              {isRejecting ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
              {isRejecting ? t('card.actions.rejecting') : t('card.actions.reject')}
            </Button>
            <Button
              onClick={() => onAccept(quote.id)}
              disabled={isAccepting}
              size="sm"
              className="flex-1 sm:flex-none h-10 rounded-xl gap-2 text-xs font-bold shadow-sm"
            >
              {isAccepting ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              {isAccepting ? t('card.actions.accepting') : t('card.actions.accept')}
            </Button>
          </>
        ) : isPending && !isRequestOpen ? (
          <Button disabled variant="ghost" size="sm" className="flex-1 sm:flex-none h-10 rounded-xl text-xs font-bold opacity-50">
            {t('card.actions.closed')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
