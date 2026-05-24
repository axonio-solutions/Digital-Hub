'use client'

import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BadgeCheck,
  Clock,
  FileText,
  Loader2,
  MapPin,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import {
  useAnonymousQuotes,
  useMyQuoteForRequest,
} from '../hooks/use-marketplace'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageSlider } from '@/components/ui/image-slider'
import { CategoryDisplay } from '@/components/ui/category-display'
import { tCategory } from '@/utils/category-utils'
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from '@/components/ui/stat'
import { cn } from '@/lib/utils'

const SubmitQuoteForm = lazy(() =>
  import('./submit-quote-form').then((m) => ({ default: m.SubmitQuoteForm })),
)

interface SendOfferDialogProps {
  request: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

function statIndicatorColorFor(bg: string) {
  if (bg.includes('emerald')) return 'success' as const
  if (bg.includes('blue')) return 'info' as const
  return 'default' as const
}

function StatCard({
  count,
  label,
  bg,
  border,
  textColor,
  Icon,
  isLoading,
}: {
  count: number
  label: string
  bg: string
  border: string
  textColor: string
  Icon: any
  isLoading?: boolean
}) {
  return (
    <>
      {/* Mobile */}
      <div
        className={cn(
          'rounded-lg border transition-all duration-200 sm:hidden',
          bg,
          border,
          'hover:shadow-sm',
        )}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">
              {label}
            </p>
            <Icon className="w-3 h-3 text-muted-foreground/30 shrink-0" />
          </div>
          {isLoading ? (
            <div className="h-6 w-12 rounded bg-muted-foreground/10 animate-pulse" />
          ) : (
            <p
              className={cn(
                'text-xl font-bold leading-none tabular-nums',
                textColor,
              )}
            >
              {count}
            </p>
          )}
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden sm:block">
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatIndicator variant="icon" color={statIndicatorColorFor(bg)}>
            <Icon />
          </StatIndicator>
          <StatValue>{count}</StatValue>
        </Stat>
      </div>
    </>
  )
}

export function SendOfferDialog({
  request,
  isOpen,
  onOpenChange,
  user,
}: SendOfferDialogProps) {
  const { t, i18n } = useTranslation('marketplace')
  const isRtl = i18n.dir() === 'rtl'

  const { data: anonymousQuotes, isLoading: quotesLoading } =
    useAnonymousQuotes(isOpen ? request?.id : undefined)
  const { data: myQuote, isLoading: myQuoteLoading } = useMyQuoteForRequest(
    isOpen ? request?.id : undefined,
  )

  if (!request) return null

  const accepted =
    anonymousQuotes?.filter((q: any) => q.status === 'accepted') ?? []
  const pending =
    anonymousQuotes?.filter((q: any) => q.status === 'pending') ?? []
  const total = anonymousQuotes?.length ?? 0

  const otherQuotes = (anonymousQuotes ?? [])
    .filter((q: any) => q.sellerId !== user?.id)
    .sort((a: any, b: any) => {
      if (a.status === 'accepted' && b.status !== 'accepted') return -1
      if (b.status === 'accepted' && a.status !== 'accepted') return 1
      return 0
    })

  const isPriority = request.isPriority || request.urgency === 'asap'

  const statsCards = [
    {
      count: total,
      label: t('offer_dialog.offers_total'),
      bg: 'bg-card',
      border: 'border-border/30',
      textColor: 'text-foreground',
      Icon: TrendingUp,
    },
    {
      count: accepted.length,
      label: t('offer_dialog.offers_in_discussion'),
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/20',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      Icon: BadgeCheck,
    },
    {
      count: pending.length,
      label: t('offer_dialog.offers_pending'),
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800/20',
      textColor: 'text-blue-700 dark:text-blue-400',
      Icon: Clock,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRtl ? 'rtl' : 'ltr'}
        className={cn(
          'sm:max-w-[1200px] w-[95vw] max-w-[calc(100vw-1rem)]',
          'max-h-[90dvh] p-0 flex flex-col gap-0 overflow-hidden',
          'rounded-xl border border-border/20 bg-card',
          'shadow-[0_8px_24px_-4px_rgba(30,41,59,0.05)]',
        )}
      >
        {/* ── Header ─────────────────────────── */}
        <div className="shrink-0 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-border/20">
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t('offer_dialog.send_offer_title')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/70 mt-1 leading-relaxed">
              {t('offer_dialog.send_offer_desc')}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Split Body ─────────────────────── */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* ═══ Left Panel: Context ═══ */}
          <div className="w-full lg:w-1/2 overflow-y-auto px-6 sm:px-8 py-6 lg:border-r border-border/20 space-y-6">
            {/* Image + Priority */}
            <div className="relative">
              <ImageSlider images={request.imageUrls || []} aspectRatio="4/3" />
              {isPriority && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-destructive/20 shadow-sm">
                    <Zap className="w-3 h-3 fill-current shrink-0" />
                    {t('offer_dialog.priority')}
                  </span>
                </div>
              )}
            </div>

            {/* Part Name */}
            <h2 className="text-lg font-bold text-foreground leading-tight tracking-tight">
              {request.partName}
            </h2>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                  {t('offer_dialog.vehicle')}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {request.vehicleBrand}
                  {request.modelYear && (
                    <span className="text-muted-foreground font-normal">
                      {' '}
                      · {request.modelYear}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                  {t('offer_dialog.oem')}
                </p>
                <p className="text-sm font-medium text-foreground font-mono break-all">
                  {request.oemNumber || (
                    <span className="text-muted-foreground/50 italic text-xs">
                      {t('offer_dialog.not_available')}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                  {t('offer_dialog.location')}
                </p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  {request.location || t('offer_dialog.algeria')}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                  {t('offer_dialog.category')}
                </p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                  <CategoryDisplay
                    category={request.category}
                    showName={false}
                    iconClassName="size-3.5"
                  />
                  <span>
                    {tCategory(
                      request.category?.name ||
                        request.category ||
                        request.categoryId,
                      t,
                    )}
                  </span>
                </p>
              </div>
            </div>

            {/* Buyer Notes */}
            {request.description && (
              <div className="pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">
                  {t('offer_dialog.buyer_notes')}
                </p>
                <div className="bg-muted/15 p-3 rounded-lg border-l-4 border-primary/40 italic text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{request.description}&rdquo;
                </div>
              </div>
            )}

            {/* Market divider */}
            <div className="flex items-center gap-3 pt-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
                {t('offer_dialog.offers_tab')}
              </span>
              <div className="flex-1 h-px bg-border/30" />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3">
              {statsCards.map((card) => (
                <StatCard
                  key={card.label}
                  {...card}
                  isLoading={quotesLoading}
                />
              ))}
            </div>

            {/* Competitor list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  {t('offer_dialog.competing_offers')}
                </span>
                {!quotesLoading && otherQuotes.length > 0 && (
                  <span className="text-[9px] font-mono font-bold text-muted-foreground/30 bg-muted/30 px-1.5 py-0.5 rounded-full">
                    {otherQuotes.length}
                  </span>
                )}
              </div>

              {quotesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-5 w-20 rounded-full bg-muted-foreground/10 animate-pulse" />
                        <div className="h-3 w-16 rounded bg-muted-foreground/10 animate-pulse" />
                      </div>
                      <div className="h-3 w-20 rounded bg-muted-foreground/10 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : otherQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/30 rounded-lg border border-dashed border-border/20">
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-semibold">
                    {t('offer_dialog.offers_no_offers')}
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border border-border/20 divide-y divide-border/10">
                  {otherQuotes.map((quote: any, i: number) => {
                    const isAccepted = quote.status === 'accepted'
                    return (
                      <div
                        key={quote.id ?? i}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 transition-colors duration-150',
                          'hover:bg-muted/20 cursor-pointer',
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span
                            className={cn(
                              'text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 leading-none',
                              isAccepted
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-primary/10 text-primary border-primary/20',
                            )}
                          >
                            {isAccepted
                              ? t('offer_dialog.offers_in_discussion')
                              : t('offer_dialog.offers_pending')}
                          </span>
                          <p className="text-xs font-bold text-muted-foreground/30 font-mono tracking-[0.15em] select-none">
                            {'\u2022'.repeat(6)}
                          </p>
                        </div>
                        <p className="text-xs font-mono font-bold text-muted-foreground/20 blur-[3px] select-none tracking-[0.1em]">
                          {'\u2022'.repeat(8)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}

              {total > 0 && (
                <p className="text-[10px] text-muted-foreground/50 italic mt-2 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 shrink-0 text-muted-foreground/40" />
                  {t('offer_dialog.market_info')}
                </p>
              )}
            </div>
          </div>

          {/* ═══ Right Panel: Form ═══ */}
          <div className="w-full lg:w-1/2 overflow-y-auto px-6 sm:px-8 py-6 flex flex-col">
            {myQuoteLoading ? (
              <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground/40">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-medium">
                  {t('offer_dialog.offers_loading')}
                </span>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
                  </div>
                }
              >
                <SubmitQuoteForm
                  quoteId={myQuote?.id}
                  requestId={request.id}
                  sellerId={user?.id || ''}
                  requestImages={request.imageUrls}
                  category={request.category?.name || request.category}
                  oemNumber={request.oemNumber}
                  notes={request.notes}
                  vehicleInfo={{
                    brand: request.vehicleBrand || t('defaults.unknown'),
                    model: request.vehicleModel || t('defaults.unknown'),
                    year: request.modelYear || t('defaults.unknown'),
                  }}
                  initialData={
                    myQuote
                      ? {
                          price: myQuote.price,
                          condition: myQuote.condition,
                          warranty: myQuote.warranty ?? '',
                        }
                      : undefined
                  }
                  layout="compact"
                  showContext={false}
                  onSuccess={() => onOpenChange(false)}
                />
              </Suspense>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
