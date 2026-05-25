'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Phone,
  RotateCcw,
  Shield,
  Tag,
  Undo2,
  XCircle,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/date-format'
import { Button } from '@/components/ui/button'
import { ActionConfirmDialog } from '@/features/buyer/components/action-confirm-dialog'
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
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

  const [dialog, setDialog] = useState<{
    type: 'accept' | 'reject' | 'revoke' | 'unreject'
  } | null>(null)

  const loadingRef = useRef<Record<string, boolean>>({
    accept: false,
    reject: false,
    revoke: false,
    unreject: false,
  })

  useEffect(() => {
    if (!dialog) return
    const loadingMap = {
      accept: isAccepting,
      reject: isRejecting,
      revoke: isRevoking,
      unreject: isUnrejecting,
    }
    const type = dialog.type
    const wasLoading = loadingRef.current[type]
    const nowLoading = loadingMap[type]
    if (wasLoading && !nowLoading) {
      setDialog(null)
    }
    loadingRef.current[type] = nowLoading
  }, [isAccepting, isRejecting, isRevoking, isUnrejecting, dialog])

  const sellerName =
    quote.seller?.storeName || quote.seller?.name || t('card.authorized_seller')
  const initials = getInitials(sellerName)

  const conditionLabel = quote.condition
    ? t(`columns.conditions.${quote.condition}`, {
        defaultValue: quote.condition,
      })
    : t('columns.conditions.used')

  const locationLabel =
    quote.seller?.wilaya ||
    quote.seller?.city ||
    quote.seller?.address ||
    t('card.default_location')
  const warrantyLabel = quote.warranty || t('card.no_warranty')

  const handleDialogConfirm = () => {
    if (!dialog) return
    const actions = {
      accept: () => onAccept(quote.id),
      reject: () => onReject(quote.id),
      revoke: () => onRevoke(quote.id),
      unreject: () => onUnreject(quote.id),
    }
    actions[dialog.type]()
  }

  return (
    <>
      <div
        className={cn(
          'rounded-2xl border bg-card overflow-hidden transition-all duration-300 ease-in-out',
          isAccepted && 'border-primary/30 ring-1 ring-primary/10',
          isRejected && 'border-muted bg-muted/10',
          isPending && 'hover:border-primary/20 hover:shadow-sm',
        )}
      >
        <div className="p-4 sm:p-5">
          {/* Seller + Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'size-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0',
                  isAccepted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary',
                )}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {sellerName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t('card.authorized_seller')}
                </p>
              </div>
            </div>

            {isAccepted && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1.5 rounded-full shrink-0 shadow-sm">
                <CheckCircle2 className="size-3.5" />
                {t('columns.statuses.accepted')}
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-3 py-1.5 rounded-full shrink-0 shadow-sm">
                <XCircle className="size-3.5" />
                {t('card.rejected')}
              </span>
            )}
            {isPending && isRequestOpen && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-full shrink-0 shadow-sm">
                {t('columns.statuses.pending')}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 sm:mt-5 py-3 sm:py-4 px-4 sm:px-5 -mx-4 sm:-mx-5 bg-muted/30 border-y border-border/40">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {t('card.price_label')}
              </span>
              <div className="text-end">
                <span
                  className={cn(
                    'text-4xl sm:text-5xl font-black tracking-tight leading-none',
                    isAccepted ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {quote.price.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-muted-foreground ms-1.5">
                  {t('columns.currency')}
                </span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-4 grid grid-cols-2 gap-px bg-border/40 rounded-xl overflow-hidden">
            <div className="bg-card px-3.5 py-2.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Tag className="size-3" />
                {t('card.condition_label')}
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {conditionLabel}
              </p>
            </div>
            <div className="bg-card px-3.5 py-2.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin className="size-3" />
                {t('card.location_label')}
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                {locationLabel}
              </p>
            </div>
            <div className="bg-card px-3.5 py-2.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Shield className="size-3" />
                {t('card.warranty_label')}
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {warrantyLabel}
              </p>
            </div>
            <div className="bg-card px-3.5 py-2.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="size-3" />
                {t('card.submitted_label')}
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {formatRelativeTime(quote.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-row items-center gap-2">
            {isAccepted ? (
              <>
                <Button
                  onClick={() => onContact(quote.seller)}
                  variant="default"
                  className="flex-1 h-10 rounded-lg gap-1.5 text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <Phone className="size-4" />
                  {t('card.actions.contact')}
                </Button>
                {isRequestOpen && (
                  <>
                    <Button
                      onClick={() => setDialog({ type: 'revoke' })}
                      disabled={isRevoking}
                      variant="outline"
                      className={cn(
                        'flex-1 h-10 rounded-lg gap-1.5 text-sm font-medium transition-all duration-200 cursor-pointer border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950',
                        isRevoking && 'animate-pulse',
                      )}
                    >
                      {isRevoking ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Undo2 className="size-4" />
                      )}
                      {isRevoking
                        ? t('card.actions.revoking')
                        : t('card.actions.revoke')}
                    </Button>
                    <Button
                      onClick={() => setDialog({ type: 'reject' })}
                      disabled={isRejecting}
                      variant="outline"
                      className={cn(
                        'flex-1 h-10 rounded-lg gap-1.5 text-sm font-medium transition-all duration-200 cursor-pointer border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950',
                        isRejecting && 'animate-pulse',
                      )}
                    >
                      {isRejecting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      {isRejecting
                        ? t('card.actions.rejecting')
                        : t('card.actions.reject')}
                    </Button>
                  </>
                )}
              </>
            ) : isRejected ? (
              isRequestOpen ? (
                <Button
                  onClick={() => setDialog({ type: 'unreject' })}
                  disabled={isUnrejecting}
                  variant="outline"
                  className={cn(
                    'flex-1 h-10 rounded-lg gap-1.5 text-sm font-medium border-primary/30 text-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer',
                    isUnrejecting && 'animate-pulse',
                  )}
                >
                  <span className="inline-flex items-center gap-2 transition-all duration-300">
                    {isUnrejecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RotateCcw className="size-4" />
                    )}
                    <span>
                      {isUnrejecting
                        ? t('card.actions.unrejecting')
                        : t('card.actions.unreject')}
                    </span>
                  </span>
                </Button>
              ) : (
                <Button
                  disabled
                  variant="ghost"
                  className="flex-1 h-10 rounded-lg text-sm font-medium opacity-50"
                >
                  {t('card.rejected')}
                </Button>
              )
            ) : isPending && isRequestOpen ? (
              <>
                <Button
                  onClick={() => setDialog({ type: 'accept' })}
                  disabled={isAccepting}
                  variant="default"
                  className={cn(
                    'flex-1 h-10 rounded-lg gap-1.5 text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer',
                    isAccepting && 'animate-pulse',
                  )}
                >
                  <span className="inline-flex items-center gap-2 transition-all duration-300">
                    {isAccepting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    <span>
                      {isAccepting
                        ? t('card.actions.accepting')
                        : t('card.actions.accept')}
                    </span>
                  </span>
                </Button>
                <Button
                  onClick={() => setDialog({ type: 'reject' })}
                  disabled={isRejecting}
                  variant="outline"
                  className={cn(
                    'flex-1 h-10 rounded-lg gap-1.5 text-sm font-medium transition-all duration-200 cursor-pointer',
                    isRejecting && 'animate-pulse',
                  )}
                >
                  <span className="inline-flex items-center gap-2 transition-all duration-300">
                    {isRejecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    <span>
                      {isRejecting
                        ? t('card.actions.rejecting')
                        : t('card.actions.reject')}
                    </span>
                  </span>
                </Button>
              </>
            ) : (
              <Button
                disabled
                variant="ghost"
                className="flex-1 h-10 rounded-lg text-sm font-medium opacity-50"
              >
                {t('card.actions.closed')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Accept Dialog */}
      <ActionConfirmDialog
        open={dialog?.type === 'accept'}
        onOpenChange={() => setDialog(null)}
        title={t('dialogs.accept.title')}
        description={t('dialogs.accept.description', {
          seller: sellerName,
          price: quote.price.toLocaleString(),
        })}
        confirmLabel={t('dialogs.accept.confirm')}
        actionVariant="accept"
        isLoading={isAccepting}
        loadingLabel={t('card.actions.accepting')}
        onConfirm={handleDialogConfirm}
      >
        <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-sm text-primary shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">
              {sellerName}
            </p>
            <p className="text-xs text-muted-foreground">{locationLabel}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-foreground">
              {quote.price.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t('columns.currency')}
            </p>
          </div>
        </div>
      </ActionConfirmDialog>

      {/* Reject Dialog */}
      <ActionConfirmDialog
        open={dialog?.type === 'reject'}
        onOpenChange={() => setDialog(null)}
        title={t('dialogs.reject.title')}
        description={t('dialogs.reject.description', {
          seller: sellerName,
        })}
        confirmLabel={t('dialogs.reject.confirm')}
        actionVariant="reject"
        isLoading={isRejecting}
        loadingLabel={t('card.actions.rejecting')}
        onConfirm={handleDialogConfirm}
      />

      {/* Revoke Dialog */}
      <ActionConfirmDialog
        open={dialog?.type === 'revoke'}
        onOpenChange={() => setDialog(null)}
        title={t('dialogs.revoke.title')}
        description={t('dialogs.revoke.description', {
          seller: sellerName,
        })}
        confirmLabel={t('dialogs.revoke.confirm')}
        actionVariant="revoke"
        isLoading={isRevoking}
        loadingLabel={t('card.actions.revoking')}
        onConfirm={handleDialogConfirm}
      />

      {/* Unreject Dialog */}
      <ActionConfirmDialog
        open={dialog?.type === 'unreject'}
        onOpenChange={() => setDialog(null)}
        title={t('dialogs.unreject.title')}
        description={t('dialogs.unreject.description', {
          seller: sellerName,
        })}
        confirmLabel={t('dialogs.unreject.confirm')}
        actionVariant="unreject"
        isLoading={isUnrejecting}
        loadingLabel={t('card.actions.unrejecting')}
        onConfirm={handleDialogConfirm}
      />
    </>
  )
}
