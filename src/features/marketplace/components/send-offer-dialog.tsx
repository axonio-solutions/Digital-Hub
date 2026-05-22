/* Hallmark · component: dialog · genre: modern-minimal
 * pre-emit critique: P5 H5 E4 S5 R5 V4
 * states: default · hover · focus · active · disabled · loading · empty · error
 */
'use client'

import React, { Suspense, lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  Loader2,
  MapPin,
  Package,
  Shield,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import {
  useAnonymousQuotes,
  useMyQuoteForRequest,
} from '../hooks/use-marketplace'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { tCategory } from '@/utils/category-utils'
import { CategoryDisplay } from '@/components/ui/category-display'
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

function ImageSlider({
  images,
  alt,
  className,
}: {
  images: Array<string>
  alt: string
  className?: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { t, i18n } = useTranslation('marketplace')
  const isRtl = i18n.dir() === 'rtl'

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center gap-2 text-muted-foreground/20 bg-muted/15 border border-border/30 rounded-xl',
          className,
        )}
      >
        <Package className="w-7 h-7" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em]">
          {t('offer_dialog.no_image')}
        </span>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border/30',
          className,
        )}
      >
        <img src={images[0]} alt={alt} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative group w-full overflow-hidden rounded-xl border border-border/30',
        className,
      )}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${isRtl ? '' : '-'}${currentIndex * 100}%)`,
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0">
            <img
              src={img}
              alt={`${alt} ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <button
        className="absolute start-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-0"
        onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
        disabled={currentIndex === 0}
        aria-label={t('offer_dialog.previous_image')}
      >
        <ChevronLeft className="size-3.5 rtl:-scale-x-100 text-white" />
      </button>

      <button
        className="absolute end-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-0"
        onClick={() =>
          setCurrentIndex((p) => Math.min(images.length - 1, p + 1))
        }
        disabled={currentIndex === images.length - 1}
        aria-label={t('offer_dialog.next_image')}
      >
        <ChevronRight className="size-3.5 rtl:-scale-x-100 text-white" />
      </button>

      <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={cn(
              'h-1 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50',
              idx === currentIndex
                ? 'w-4 bg-white'
                : 'w-1 bg-white/40 hover:bg-white/70',
            )}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`${t('offer_dialog.go_to_slide')} ${idx + 1}`}
          />
        ))}
      </div>
    </div>
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

  const accepted = anonymousQuotes?.filter((q) => q.status === 'accepted') ?? []
  const pending = anonymousQuotes?.filter((q) => q.status === 'pending') ?? []
  const total = anonymousQuotes?.length ?? 0

  const sortedQuotes = (anonymousQuotes ?? []).slice().sort((a, b) => {
    if (a.status === 'accepted' && b.status !== 'accepted') return -1
    if (b.status === 'accepted' && a.status !== 'accepted') return 1
    return 0
  })

  function renderQuoteRow(
    quote: {
      id?: string
      status: string
      condition?: string
      warranty?: string | null
      sellerId?: string
      price?: number
    },
    isOwn: boolean,
    i: number,
  ) {
    const isAccepted = quote.status === 'accepted'

    return (
      <div
        key={quote.id ?? i}
        className={cn(
          'relative flex items-start gap-3 ps-5 pe-4 py-3 rounded-lg border text-xs overflow-hidden',
          "before:content-[''] before:absolute before:start-0 before:inset-y-0 before:w-[3px]",
          isOwn
            ? 'bg-primary/5 border-primary/15 before:bg-primary'
            : isAccepted
              ? 'bg-emerald-500/5 border-emerald-500/15 before:bg-emerald-500'
              : 'bg-muted/15 border-border/30 before:bg-muted-foreground/20',
        )}
      >
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider',
                isOwn
                  ? 'text-primary'
                  : isAccepted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground/50',
              )}
            >
              {isOwn
                ? t('offer_dialog.my_offer_badge')
                : isAccepted
                  ? t('offer_dialog.offers_in_discussion')
                  : t('offer_dialog.offers_pending')}
            </span>
            <span className="text-muted-foreground/50 font-medium">
              {isOwn
                ? quote.condition === 'new'
                  ? t('offer_dialog.offers_new_part')
                  : t('offer_dialog.offers_used_part')
                : '•••'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground/50">
            {quote.warranty ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-medium">
                  {t('offer_dialog.offers_warranty', {
                    warranty: quote.warranty,
                  })}
                </span>
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 shrink-0" />
                <span className="text-[10px]">
                  {t('offer_dialog.offers_no_warranty')}
                </span>
              </>
            )}
          </div>
        </div>
        <div
          className={cn(
            'font-mono font-bold text-sm shrink-0 tabular-nums pt-0.5',
            isOwn ? 'text-foreground' : 'text-muted-foreground/25',
          )}
        >
          {isOwn ? `${Number(quote.price).toLocaleString()} DA` : '•••• DA'}
        </div>
      </div>
    )
  }

  // ── Details ────────────────────────────────────────────────────────────────
  const detailsContent = (
    <div className="flex flex-col gap-5 h-full min-w-0">
      <div className="shrink-0 flex flex-col gap-1.5">
        {request.urgency === 'asap' && (
          <span className="inline-flex items-center gap-1 text-rose-500 text-[10px] font-bold uppercase tracking-[0.12em] w-fit">
            <Zap className="w-3 h-3 fill-current" />
            {t('offer_dialog.priority')}
          </span>
        )}
        <h2 className="text-xl font-bold text-foreground leading-tight tracking-tight">
          {request.partName}
        </h2>
      </div>

      <ImageSlider
        images={request.imageUrls || []}
        alt={request.partName}
        className="w-full aspect-video shrink-0"
      />

      <div className="rounded-xl border border-border/40 overflow-hidden shrink-0">
        <div className="grid grid-cols-2 divide-x divide-border/30 rtl:divide-x-reverse border-b border-border/30">
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
              <BadgeCheck className="w-3 h-3 shrink-0" />
              {t('offer_dialog.vehicle')}
            </div>
            <div className="text-sm font-semibold text-foreground leading-snug">
              {request.vehicleBrand}
              {request.modelYear && (
                <span className="text-muted-foreground font-normal">
                  {' '}
                  · {request.modelYear}
                </span>
              )}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
              <FileText className="w-3 h-3 shrink-0" />
              {t('offer_dialog.oem')}
            </div>
            <div className="text-sm font-semibold text-foreground font-mono leading-snug break-all">
              {request.oemNumber || t('offer_dialog.not_available')}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border/30 rtl:divide-x-reverse">
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {t('offer_dialog.location')}
            </div>
            <div className="text-sm font-semibold text-foreground leading-snug">
              {request.location || t('offer_dialog.algeria')}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
              <Info className="w-3 h-3 shrink-0" />
              {t('offer_dialog.category')}
            </div>
            <div className="text-sm font-semibold text-primary leading-snug flex items-center gap-1.5 flex-wrap">
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
            </div>
          </div>
        </div>
      </div>

      {request.description && (
        <div className="px-4 py-3.5 rounded-xl border border-dashed border-border/40 bg-muted/15 shrink-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">
            {t('offer_dialog.buyer_notes')}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed italic break-words whitespace-pre-wrap">
            &ldquo;{request.description}&rdquo;
          </p>
        </div>
      )}
    </div>
  )

  // ── Offers ─────────────────────────────────────────────────────────────────
  const offersTabContent = (
    <div className="flex flex-col gap-4 h-full min-w-0">
      {total > 0 && !quotesLoading && (
        <div className="grid grid-cols-3 rounded-xl border border-border/40 overflow-hidden divide-x divide-border/30 rtl:divide-x-reverse shrink-0">
          {[
            {
              count: accepted.length,
              label: t('offer_dialog.offers_in_discussion'),
              color: 'text-emerald-600 dark:text-emerald-400',
            },
            {
              count: pending.length,
              label: t('offer_dialog.offers_pending'),
              color: 'text-blue-600 dark:text-blue-400',
            },
            {
              count: total,
              label: t('offer_dialog.offers_total'),
              color: 'text-foreground',
            },
          ].map(({ count, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center py-3.5 px-2 text-center"
            >
              <span
                className={cn(
                  'text-2xl font-black tabular-nums leading-none',
                  color,
                )}
              >
                {count}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50 mt-1 leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        <Users className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
          {t('offer_dialog.competing_offers')}
        </span>
      </div>

      {quotesLoading ? (
        <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">
            {t('offer_dialog.offers_loading')}
          </span>
        </div>
      ) : total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground/30">
          <Users className="w-9 h-9" />
          <span className="text-xs font-semibold">
            {t('offer_dialog.offers_no_offers')}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedQuotes.map((quote, i) =>
            renderQuoteRow(quote, quote.sellerId === user?.id, i),
          )}
        </div>
      )}
    </div>
  )

  // ── Your Offer ─────────────────────────────────────────────────────────────
  const yourOfferContent = (
    <div className="flex flex-col gap-5 h-full min-w-0">
      {myQuoteLoading ? (
        <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">
            {t('offer_dialog.offers_loading')}
          </span>
        </div>
      ) : myQuote ? (
        <>
          <div className="rounded-xl border border-border/40 overflow-hidden shrink-0">
            <div
              className={cn(
                'flex items-center justify-between px-4 py-2.5 border-b border-border/30',
                myQuote.status === 'accepted'
                  ? 'bg-emerald-500/5'
                  : 'bg-blue-500/5',
              )}
            >
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {t('offer_dialog.my_current_offer')}
                </span>
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
                  myQuote.status === 'accepted'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                )}
              >
                {myQuote.status === 'accepted'
                  ? t('offer_dialog.offers_in_discussion')
                  : t('offer_dialog.offers_pending')}
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border/30 rtl:divide-x-reverse">
              <div className="px-4 py-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                  {t('form.price_label')}
                </div>
                <div className="text-base font-black text-foreground font-mono tabular-nums leading-none">
                  {Number(myQuote.price).toLocaleString()}
                  <span className="text-[10px] text-muted-foreground/60 font-semibold ms-1">
                    DZD
                  </span>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                  {t('form.condition_label')}
                </div>
                <div className="text-sm font-bold text-foreground leading-snug mt-0.5">
                  {myQuote.condition === 'new'
                    ? t('conditions.new')
                    : t('conditions.used')}
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                  {t('form.warranty_label')}
                </div>
                <div className="text-sm font-bold text-foreground leading-snug mt-0.5 truncate">
                  {myQuote.warranty || t('offer_dialog.offers_no_warranty')}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 shrink-0" />

          <div className="shrink-0">
            <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">
              {t('offer_dialog.adjust_title')}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('offer_dialog.adjust_desc')}
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
                </div>
              }
            >
              <SubmitQuoteForm
                quoteId={myQuote.id}
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
                initialData={{
                  price: myQuote.price,
                  condition: myQuote.condition,
                  warranty: myQuote.warranty ?? '',
                }}
                layout="default"
                showContext={false}
                onSuccess={() => onOpenChange(false)}
              />
            </Suspense>
          </div>
        </>
      ) : (
        <>
          <div className="shrink-0">
            <h3 className="text-xl font-bold text-foreground tracking-tight mb-1">
              {t('offer_dialog.submit_title')}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('offer_dialog.submit_desc')}
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
                </div>
              }
            >
              <SubmitQuoteForm
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
                layout="default"
                showContext={false}
                onSuccess={() => onOpenChange(false)}
              />
            </Suspense>
          </div>
        </>
      )}
    </div>
  )

  const tabItems = [
    { value: 'details', Icon: FileText, label: t('offer_dialog.details_tab') },
    { value: 'offers', Icon: Users, label: t('offer_dialog.offers_tab') },
    {
      value: 'your-offer',
      Icon: BadgeCheck,
      label: t('offer_dialog.offer_tab'),
    },
  ] as const

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRtl ? 'rtl' : 'ltr'}
        className="sm:max-w-[1200px] w-[95vw] max-w-[calc(100vw-1rem)] max-h-[90dvh] p-0 border border-border/40 rounded-2xl shadow-xl bg-card overflow-hidden flex flex-col"
      >
        <Tabs
          defaultValue="details"
          className="flex flex-col flex-1 min-h-0"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="shrink-0 border-b border-border/30 px-1">
            <TabsList className="flex h-auto bg-transparent rounded-none p-0 gap-0 w-full justify-start">
              {tabItems.map(({ value, Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-3.5',
                    'rounded-none bg-transparent shadow-none',
                    'text-[11px] font-semibold uppercase tracking-wider',
                    'text-muted-foreground/50 hover:text-muted-foreground',
                    'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                    value === 'your-offer'
                      ? 'data-[state=active]:text-primary'
                      : 'data-[state=active]:text-foreground',
                    'transition-colors duration-150',
                    "after:content-[''] after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full",
                    value === 'your-offer'
                      ? 'after:bg-primary'
                      : 'after:bg-foreground',
                    'after:scale-x-0 data-[state=active]:after:scale-x-100',
                    'after:transition-transform after:duration-200 after:origin-center',
                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent
            value="details"
            className="flex-1 overflow-y-auto p-4 sm:p-5 mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex-col"
          >
            {detailsContent}
          </TabsContent>

          <TabsContent
            value="offers"
            className="flex-1 overflow-y-auto p-4 sm:p-5 mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex-col"
          >
            {offersTabContent}
          </TabsContent>

          <TabsContent
            value="your-offer"
            className="flex-1 overflow-y-auto p-4 sm:p-5 mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex-col"
          >
            {yourOfferContent}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
