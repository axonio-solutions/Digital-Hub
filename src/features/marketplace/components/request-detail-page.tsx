'use client'

/* Hallmark · genre: modern-minimal · macrostructure: Marketplace-Detail (public-shell page)
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * theme: brand blue hue 260° · design-system: design.md
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { arSA, enUS, fr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  ChevronDown,
  Clock,
  Coins,
  Edit2,
  FileSearch,
  Hash,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  Zap,
} from 'lucide-react'
import { SubmitOfferTab } from './submit-offer-tab'
import type { Locale } from 'date-fns'
import Navbar from '@/components/layout/navbar'
import {
  usePublicTaxonomy,
  useRequestDetails,
} from '@/features/requests/hooks/use-requests'
import {
  useAnonymousQuotes,
  useDeleteQuote,
  useMyQuoteForRequest,
} from '@/features/marketplace/hooks/use-marketplace'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ImageSlider } from '@/components/ui/image-slider'
import { CategoryDisplay } from '@/components/ui/category-display'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Stat, StatIndicator, StatLabel, StatValue } from '@/components/ui/stat'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { PUBLIC_ROUTES } from '@/lib/routes'

const dateFnsLocales: Record<string, Locale> = { en: enUS, fr, ar: arSA }

function catKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
}

function timeAgo(date: string, locale?: Locale) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale })
  } catch {
    return ''
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailsSkeleton() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-9 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
        </div>
        <Skeleton className="h-[72px] w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Error ────────────────────────────────────────────────────────────────────

function ErrorView({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-4">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <FileSearch className="size-8 text-muted-foreground/40" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold tracking-tight">
          {t('detail_page.request_not_found')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {t('detail_page.request_not_found_desc')}
        </p>
      </div>
      <Link to={PUBLIC_ROUTES.EXPLORE as any}>
        <Button variant="outline" size="sm" className="h-9 rounded-xl">
          {t('detail_page.back_to_explore')}
        </Button>
      </Link>
    </div>
  )
}

// ─── Offer Row ────────────────────────────────────────────────────────────────

function OfferRow({
  quote,
  rank,
  isOwn,
  isLocked,
  isInactive,
  onEdit,
  onDelete,
  isDeleting,
  t,
  dateLocale,
}: {
  quote: any
  rank: number
  isOwn: boolean
  isLocked: boolean
  isInactive: boolean
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
  t: (key: string) => string
  dateLocale?: Locale
}) {
  const status = quote.status
  const isAccepted = status === 'accepted'
  const isRejected = status === 'rejected'

  const statusLabel = isAccepted
    ? isInactive
      ? t('detail_page.offer_selected')
      : t('offer_dialog.offers_in_discussion')
    : isRejected
      ? t('statuses.rejected')
      : t('statuses.pending')

  const statusStyle = isAccepted
    ? isInactive
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:border-emerald-800/40'
      : 'bg-blue-50 text-[#0369A1] border-blue-200/50 dark:bg-blue-950/40 dark:border-blue-800/40'
    : isRejected
      ? 'bg-muted text-muted-foreground/50 border-border/50'
      : 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/40 dark:border-amber-800/40'

  return (
    <div
      className={cn(
        'px-4 sm:px-5 py-3 sm:py-4 border-b border-border/40 last:border-b-0 transition-colors duration-150',
        isOwn
          ? 'bg-primary/[0.03] border-l-[3px] border-l-primary/50'
          : 'hover:bg-muted/20',
      )}
    >
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2 items-center">
        {/* Row 1: rank + status + own badge */}
        <span
          className={cn(
            'size-6 sm:size-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold tabular-nums',
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground/60',
          )}
        >
          #{rank}
        </span>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide border leading-none justify-self-start',
            statusStyle,
          )}
        >
          {statusLabel}
        </span>
        {isOwn && (
          <span className="text-[9px] font-semibold text-primary/50 justify-self-end">
            {isAccepted && isInactive
              ? t('detail_page.offer_selected')
              : t('offer_dialog.my_offer_badge')}
          </span>
        )}

        {/* Row 2: price + condition/warranty + actions */}
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-start">
          <div className="min-w-0">
            {isOwn ? (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[15px] sm:text-[17px] font-bold tabular-nums text-primary leading-none">
                  {quote.price?.toLocaleString()}
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground/60 ml-1">
                    DA
                  </span>
                </span>
                <span className="text-[11px] sm:text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Package className="size-2.5 sm:size-3 shrink-0" />
                  {quote.condition === 'new'
                    ? t('detail_page.new_oem')
                    : t('conditions.used')}
                </span>
                {quote.warranty && (
                  <span className="text-[11px] sm:text-xs text-muted-foreground/60 flex items-center gap-1">
                    <ShieldCheck className="size-2.5 sm:size-3 shrink-0" />
                    {quote.warranty}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-muted-foreground/30 tracking-widest select-none">
                  ****
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground/30">
                  DA
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground/25 select-none">
                  · **** · ****
                </span>
              </div>
            )}
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/45 mt-1 leading-none">
              {quote.createdAt ? timeAgo(quote.createdAt, dateLocale) : ''}
            </p>
          </div>

          {isOwn && (
            <div className="flex items-center gap-1.5 justify-self-stretch sm:justify-self-end mt-1 sm:mt-0">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none h-8 sm:h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer border-border hover:border-primary/40 hover:text-primary transition-all"
                onClick={onEdit}
                disabled={isLocked}
                title={isLocked ? t('detail_page.locked_title') : undefined}
              >
                <Edit2 className="size-3" />
                {t('detail_page.edit_btn')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none h-8 sm:h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer border-border text-muted-foreground/50 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"
                onClick={onDelete}
                disabled={isDeleting || isLocked}
              >
                {isDeleting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Trash2 className="size-3" />
                )}
                <span>{t('detail_page.withdraw_btn')}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Locked next-steps callout */}
      {isOwn && isLocked && (
        <div className="mt-2 flex items-start gap-2 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg px-3 py-2.5">
          <MessageSquare className="size-3.5 text-[#0369A1] shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-[11px] text-[#0369A1] leading-relaxed">
            {t('detail_page.locked_callout')}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function RequestDetailPage() {
  const { t, i18n } = useTranslation('marketplace')
  const dateLocale = dateFnsLocales[i18n.language]
  const { requestId } = useParams({ from: '/_authed/requests/$requestId' })
  const { toast } = useToast('marketplace')
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: user } = useAuth()
  const { data: request, isLoading: requestLoading } =
    useRequestDetails(requestId)
  const { data: taxonomy } = usePublicTaxonomy()
  const {
    data: anonymousQuotes,
    isLoading: quotesLoading,
    refetch: refetchQuotes,
  } = useAnonymousQuotes(requestId)
  const {
    data: myQuote,
    isLoading: myQuoteLoading,
    refetch: refetchMyQuote,
  } = useMyQuoteForRequest(requestId)
  const { mutate: deleteQuote } = useDeleteQuote()

  const brandLogos = useMemo<Record<string, string>>(() => {
    if (!taxonomy?.brands) return {}
    return (taxonomy.brands as Array<any>).reduce(
      (acc, b) => {
        if (b.brand && b.imageUrl) acc[b.brand] = b.imageUrl
        return acc
      },
      {} as Record<string, string>,
    )
  }, [taxonomy])

  const allQuotes = useMemo(() => anonymousQuotes ?? [], [anonymousQuotes])
  const total = allQuotes.length
  const pending = allQuotes.filter((q: any) => q.status === 'pending').length
  const inDiscussion = allQuotes.filter(
    (q: any) => q.status === 'accepted',
  ).length
  const selected = inDiscussion
  const rejected = allQuotes.filter((q: any) => q.status === 'rejected').length

  const sortedQuotes = useMemo(
    () =>
      [...allQuotes].sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [allQuotes],
  )

  const hasOwnOffer = !myQuoteLoading && !!myQuote
  type EditData = {
    id: string
    price: number
    condition: string
    warranty: string | null
  } | null
  const dialogModeRef = useRef<'create' | 'edit'>('create')
  const dialogEditRef = useRef<EditData>(null)

  const openCreate = () => {
    dialogModeRef.current = 'create'
    dialogEditRef.current = null
    setOfferDialogOpen(true)
  }
  const openEdit = (quoteId: string) => {
    dialogModeRef.current = 'edit'
    const found = allQuotes.find((q: any) => q.id === quoteId)
    dialogEditRef.current = found
      ? {
          id: (found as any).id,
          price: (found as any).price,
          condition: (found as any).condition,
          warranty: (found as any).warranty,
        }
      : null
    setOfferDialogOpen(true)
  }
  const handleDialogClose = (open: boolean) => {
    setOfferDialogOpen(open)
  }
  const handleOfferSuccess = () => {
    setOfferDialogOpen(false)
    dialogModeRef.current = 'create'
    dialogEditRef.current = null
    void refetchMyQuote()
    void refetchQuotes()
  }

  useEffect(() => {
    if (!offerDialogOpen) {
      dialogModeRef.current = 'create'
      dialogEditRef.current = null
    }
  }, [offerDialogOpen])

  const handleDeleteClick = (quoteId: string) => {
    setDeleteTargetId(quoteId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return
    setDeletingId(deleteTargetId)
    setDeleteDialogOpen(false)
    deleteQuote(deleteTargetId, {
      onSuccess: () => {
        toast.success('toasts.withdraw_success')
        setDeletingId(null)
        setDeleteTargetId(null)
        void refetchMyQuote()
        void refetchQuotes()
      },
      onError: (err: any) => {
        toast.error('toasts.withdraw_error', { error: err.message })
        setDeletingId(null)
      },
    })
  }

  const handleDeleteDialogCancel = () => {
    setDeleteDialogOpen(false)
    setDeleteTargetId(null)
  }

  const req = !requestLoading && request ? (request as any) : null
  const isPriority = req && (req.isPriority || req.urgency === 'asap')
  const brandName = req ? req.vehicleBrand || req.brand?.brand || '' : ''
  const brandLogoUrl = brandName ? brandLogos[brandName] : undefined
  const vehicleMatch = req
    ? [req.modelYear, req.vehicleBrand, req.vehicleModel]
        .filter(Boolean)
        .join(' ')
    : ''

  const rawCatName = req
    ? req.category?.name ||
      (typeof req.category === 'string' ? req.category : '') ||
      ''
    : ''
  const categoryName = rawCatName
    ? t(catKey(rawCatName), { ns: 'categories', defaultValue: rawCatName })
    : ''

  // Derived status signals
  const reqStatus: string = req?.status || 'open'
  const isInactive = reqStatus === 'fulfilled' || reqStatus === 'cancelled'

  // Stats definitions based on request lifecycle
  const statItems = isInactive
    ? reqStatus === 'fulfilled'
      ? [
          {
            key: 'total',
            icon: Users,
            count: total,
            label: t('detail_page.stats_total'),
            valueColor: 'text-foreground',
            iconCls: 'bg-muted text-muted-foreground',
            statColor: 'default' as const,
          },
          {
            key: 'selected',
            icon: BadgeCheck,
            count: selected,
            label: t('detail_page.stats_selected'),
            valueColor: 'text-emerald-600',
            iconCls: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40',
            statColor: 'default' as const,
          },
          {
            key: 'rejected',
            icon: FileSearch,
            count: rejected,
            label: t('detail_page.stats_rejected'),
            valueColor: 'text-muted-foreground/50',
            iconCls: 'bg-muted text-muted-foreground/40',
            statColor: 'default' as const,
          },
        ]
      : [
          {
            key: 'total',
            icon: Users,
            count: total,
            label: t('detail_page.stats_total'),
            valueColor: 'text-foreground',
            iconCls: 'bg-muted text-muted-foreground',
            statColor: 'default' as const,
          },
          {
            key: 'cancelled',
            icon: FileSearch,
            count: total,
            label: t('statuses.cancelled'),
            valueColor: 'text-muted-foreground/50',
            iconCls: 'bg-muted text-muted-foreground/40',
            statColor: 'default' as const,
          },
          {
            key: 'empty',
            icon: FileSearch,
            count: 0,
            label: '',
            valueColor: 'text-transparent',
            iconCls: 'invisible',
            statColor: 'default' as const,
          },
        ]
    : [
        {
          key: 'total',
          icon: Users,
          count: total,
          label: t('detail_page.stats_total'),
          valueColor: 'text-foreground',
          iconCls: 'bg-muted text-muted-foreground',
          statColor: 'default' as const,
        },
        {
          key: 'pending',
          icon: Clock,
          count: pending,
          label: t('detail_page.stats_pending'),
          valueColor: 'text-amber-600',
          iconCls: 'bg-amber-50 text-amber-500 dark:bg-amber-950/40',
          statColor: 'warning' as const,
        },
        {
          key: 'inDiscussion',
          icon: MessageSquare,
          count: selected,
          label: t('detail_page.stats_in_discussion'),
          valueColor: 'text-[#0369A1]',
          iconCls: 'bg-blue-50 text-[#0369A1] dark:bg-blue-950/40',
          statColor: 'info' as const,
        },
      ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {requestLoading ? (
        <DetailsSkeleton />
      ) : !req ? (
        <ErrorView t={t} />
      ) : (
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-12">
          <div className="flex flex-col gap-5 lg:gap-6">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Chips: brand + year + priority only */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  {brandName && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border/60 rounded-full text-[11px] font-semibold text-foreground">
                      {brandLogoUrl ? (
                        <img
                          src={brandLogoUrl}
                          alt={brandName}
                          className="size-4 object-contain rounded-sm shrink-0"
                        />
                      ) : (
                        <span className="size-4 rounded-sm bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary shrink-0">
                          {brandName.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                      {brandName}
                    </span>
                  )}
                  {req.modelYear && (
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-[11px] font-semibold border border-border/50">
                      {req.modelYear}
                    </span>
                  )}
                  {isPriority && (
                    <span className="inline-flex items-center gap-1 bg-destructive/8 text-destructive px-2.5 py-1 rounded-full text-[11px] font-semibold border border-destructive/15">
                      <Zap className="size-3 fill-current" />
                      {t('detail_page.priority')}
                    </span>
                  )}
                  {reqStatus !== 'open' && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                        reqStatus === 'fulfilled'
                          ? 'bg-blue-50 text-[#0369A1] border-blue-200/50 dark:bg-blue-950/30 dark:border-blue-800/30'
                          : 'bg-muted text-muted-foreground/50 border-border/50',
                      )}
                    >
                      <span
                        className={cn(
                          'size-1.5 rounded-full shrink-0',
                          reqStatus === 'fulfilled'
                            ? 'bg-[#0369A1]'
                            : 'bg-muted-foreground/40',
                        )}
                      />
                      {t('statuses.' + reqStatus)}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-[28px] font-bold text-foreground tracking-tight leading-tight break-words">
                  {req.partName}
                </h1>

                {/* Meta rail: posted date + offer count only */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-[12px] text-muted-foreground/55">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 shrink-0" />
                    {timeAgo(req.createdAt, dateLocale)}
                  </span>
                  {total > 0 && (
                    <>
                      <span className="text-border/60">·</span>
                      <span>
                        {t('detail_page.offers_received', { count: total })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0 hidden sm:flex items-center gap-3">
                <Button
                  onClick={openCreate}
                  disabled={myQuoteLoading || isInactive}
                  className="h-10 px-5 rounded-xl text-sm font-semibold gap-2 cursor-pointer"
                >
                  <Plus className="size-4" />
                  {hasOwnOffer
                    ? t('detail_page.add_offer')
                    : t('detail_page.submit_offer')}
                </Button>
              </div>
            </div>

            {/* ── Stats strip ────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Mobile */}
              <div className="grid grid-cols-3 gap-0 sm:hidden">
                {statItems.map((s, i) => (
                  <div
                    key={s.key}
                    className={cn(
                      'flex flex-col items-center gap-1 justify-center px-2 py-3',
                      'border-r border-border/40 last:border-r-0',
                    )}
                  >
                    <div
                      className={cn(
                        'size-7 rounded-lg flex items-center justify-center shrink-0',
                        s.iconCls,
                      )}
                    >
                      <s.icon className="size-3" />
                    </div>
                    <div className="text-center min-w-0">
                      {quotesLoading ? (
                        <div className="h-5 w-6 mx-auto rounded bg-muted-foreground/10 animate-pulse mb-0.5" />
                      ) : (
                        <p
                          className={cn(
                            'text-base font-bold tabular-nums leading-none truncate',
                            s.valueColor,
                          )}
                        >
                          {s.count}
                        </p>
                      )}
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/55 mt-0.5 truncate">
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden sm:grid grid-cols-3 gap-3 p-3">
                {statItems.map((s) => (
                  <Stat key={s.key}>
                    <StatLabel>{s.label}</StatLabel>
                    <StatIndicator variant="icon" color={s.statColor}>
                      <s.icon />
                    </StatIndicator>
                    <StatValue>
                      {quotesLoading ? (
                        <div className="h-6 w-8 rounded bg-muted-foreground/10 animate-pulse" />
                      ) : (
                        s.count
                      )}
                    </StatValue>
                  </Stat>
                ))}
              </div>
            </div>

            {/* ── Go to offers (mobile only) ─────────────────────────────── */}
            <button
              onClick={() =>
                document
                  .getElementById('offers-section')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="lg:hidden flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-muted/30 border border-border/50 text-[12px] font-semibold text-muted-foreground/70 hover:text-foreground hover:border-border transition-colors cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              {t('detail_page.view_offers')}
              <ChevronDown className="size-3.5" />
            </button>

            {/* ── Mobile layout (lg:hidden) ──────────────────────────────── */}
            <div className="flex flex-col gap-5 lg:hidden">
              {/* Image */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <ImageSlider
                  images={req.imageUrls || []}
                  aspectRatio="4/3"
                  expandable
                  className="rounded-none border-0"
                />
              </div>

              {/* Request Details — styled like buyer's QuoteCard */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3.5 border-b border-border/40">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('offer_dialog.request_details')}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border/40">
                  {vehicleMatch && (
                    <div className="bg-card px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        {brandLogoUrl ? (
                          <img
                            src={brandLogoUrl}
                            alt={brandName}
                            className="size-3 object-contain rounded-sm shrink-0"
                          />
                        ) : (
                          <span className="size-3 rounded-sm bg-primary/10 flex items-center justify-center text-[5px] font-bold text-primary shrink-0">
                            {brandName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                        {t('detail_page.vehicle_match')}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {vehicleMatch}
                      </p>
                    </div>
                  )}
                  {req.oemNumber && (
                    <div className="bg-card px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <BadgeCheck className="size-3 shrink-0" />
                        {t('detail_page.oem_number')}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5 break-all">
                        {req.oemNumber}
                      </p>
                    </div>
                  )}
                  {(req.location || req.brand?.clusterRegion) && (
                    <div className="bg-card px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" />
                        {t('offer_dialog.location')}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                        {req.location || req.brand?.clusterRegion}
                      </p>
                    </div>
                  )}
                  {req.category && (
                    <div className="bg-card px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <CategoryDisplay
                          category={req.category}
                          showName={false}
                          iconClassName="size-3"
                        />
                        {t('offer_dialog.category')}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {categoryName}
                      </p>
                    </div>
                  )}
                  {req.targetPrice && (
                    <div className="bg-card px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Coins className="size-3 shrink-0" />
                        {t('detail_page.buyer_target_price')}
                      </p>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {Number(req.targetPrice).toLocaleString()} DA
                      </p>
                    </div>
                  )}
                  {req.quantity && req.quantity > 1 && (
                    <div className="bg-card px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Hash className="size-3 shrink-0" />
                        {t('detail_page.quantity_needed')}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {req.quantity} units
                      </p>
                    </div>
                  )}
                </div>

                {(req.description || req.notes) && (
                  <div className="px-3.5 py-3 border-t border-border/40 bg-muted/10">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                      <MessageSquare className="size-3 shrink-0" />
                      {t('offer_dialog.buyer_notes')}
                    </p>
                    <p className="text-sm text-muted-foreground/70 italic leading-relaxed">
                      &ldquo;{req.description || req.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Offers */}
              <div
                id="offers-section"
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
                  <h2 className="text-[12px] font-semibold text-foreground flex items-center gap-2">
                    {t('detail_page.offers_title')}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground/50">
                      {t('detail_page.ranked_by_time')}
                    </span>
                    {!quotesLoading && (
                      <span className="size-[18px] rounded-full bg-muted-foreground/15 flex items-center justify-center text-[10px] font-bold text-muted-foreground tabular-nums">
                        {total}
                      </span>
                    )}
                  </h2>
                </div>

                {quotesLoading ? (
                  <div className="divide-y divide-border/30">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <Skeleton className="size-7 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-24 rounded" />
                        <div className="flex-1" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </div>
                    ))}
                  </div>
                ) : sortedQuotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-14">
                    <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Users className="size-5 text-muted-foreground/30" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-muted-foreground/60">
                        {t('detail_page.no_offers_yet')}
                      </p>
                      <p className="text-xs text-muted-foreground/40 mt-0.5">
                        {t('detail_page.no_offers_desc')}
                      </p>
                    </div>
                    {!isInactive && (
                      <Button
                        size="sm"
                        onClick={openCreate}
                        className="h-8 px-4 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer mt-1"
                      >
                        <Plus className="size-3" />
                        {t('detail_page.submit_offer')}
                      </Button>
                    )}
                  </div>
                ) : (
                  sortedQuotes.map((quote: any, i: number) => {
                    const isOwn = quote.sellerId === (user as any)?.id
                    return (
                      <OfferRow
                        key={quote.id ?? i}
                        quote={quote}
                        rank={i + 1}
                        isOwn={isOwn}
                        isLocked={
                          isOwn && (isInactive || quote.status !== 'pending')
                        }
                        isInactive={isInactive}
                        onEdit={() => openEdit(quote.id)}
                        onDelete={() => handleDeleteClick(quote.id)}
                        isDeleting={deletingId === quote.id}
                        t={t}
                        dateLocale={dateLocale}
                      />
                    )
                  })
                )}

                {total > 0 && (
                  <div className="px-4 py-2.5 bg-muted/10 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1.5">
                      <Lock className="size-3 shrink-0" />
                      {t('detail_page.anonymized_notice')}
                    </p>
                  </div>
                )}
              </div>

              {/* Competition */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
                  <h2 className="text-[12px] font-semibold text-foreground">
                    {t('detail_page.competition')}
                  </h2>
                </div>
                <div className="p-4">
                  {isInactive ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'size-2 rounded-full shrink-0',
                            reqStatus === 'fulfilled'
                              ? 'bg-emerald-500'
                              : 'bg-muted-foreground/40',
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-bold',
                            reqStatus === 'fulfilled'
                              ? 'text-emerald-600'
                              : 'text-muted-foreground/50',
                          )}
                        >
                          {reqStatus === 'fulfilled'
                            ? t('statuses.fulfilled')
                            : t('statuses.cancelled')}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                        {reqStatus === 'fulfilled'
                          ? t('detail_page.competition_fulfilled')
                          : t('detail_page.competition_cancelled')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {inDiscussion > 0 ? (
                            <span className="size-2 rounded-full bg-[#0369A1] shrink-0" />
                          ) : total > 2 ? (
                            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                          ) : (
                            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <span
                            className={cn(
                              'text-sm font-bold',
                              inDiscussion > 0
                                ? 'text-[#0369A1]'
                                : total > 2
                                  ? 'text-amber-600'
                                  : 'text-emerald-600',
                            )}
                          >
                            {inDiscussion > 0
                              ? t('detail_page.competition_hot')
                              : total === 0
                                ? t('detail_page.competition_open')
                                : total <= 2
                                  ? t('detail_page.competition_low')
                                  : t('detail_page.competition_active')}
                          </span>
                        </div>
                        <div className="flex gap-3 text-[11px] text-muted-foreground/60 font-semibold">
                          {total > 0 && (
                            <span>
                              {t('detail_page.seller_count', { count: total })}
                            </span>
                          )}
                          {inDiscussion > 0 && (
                            <span className="text-[#0369A1]">
                              {t('detail_page.in_discussion_count', {
                                count: inDiscussion,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                        {total === 0
                          ? t('detail_page.competition_no_offers')
                          : inDiscussion > 0
                            ? t('detail_page.competition_in_discussion')
                            : total === 1
                              ? t('detail_page.competition_waiting', {
                                  count: 1,
                                })
                              : t('detail_page.competition_waiting_plural', {
                                  count: total,
                                })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Desktop layout (hidden lg:grid) ─────────────────────────── */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 7 cols */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* ── Request Details ──────────────────────────────────── */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border/40 bg-muted/20">
                    <h2 className="text-[13px] font-semibold text-foreground">
                      {t('offer_dialog.request_details')}
                    </h2>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {vehicleMatch && (
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          {brandLogoUrl ? (
                            <img
                              src={brandLogoUrl}
                              alt={brandName}
                              className="size-4 object-contain rounded-sm shrink-0"
                            />
                          ) : (
                            <span className="size-4 rounded-sm bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary shrink-0">
                              {brandName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55 mb-0.5">
                            {t('detail_page.vehicle_match')}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {vehicleMatch}
                          </p>
                        </div>
                      </div>
                    )}
                    {req.oemNumber && (
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <BadgeCheck className="size-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55 mb-0.5">
                            {t('detail_page.oem_number')}
                          </p>
                          <p className="text-sm font-mono font-medium text-foreground break-all">
                            {req.oemNumber}
                          </p>
                        </div>
                      </div>
                    )}
                    {(req.location || req.brand?.clusterRegion) && (
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="size-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55 mb-0.5">
                            {t('offer_dialog.location')}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {req.location || req.brand?.clusterRegion}
                          </p>
                        </div>
                      </div>
                    )}
                    {req.category && (
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <CategoryDisplay
                            category={req.category}
                            showName={false}
                            iconClassName="size-4"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55 mb-0.5">
                            {t('offer_dialog.category')}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {categoryName}
                          </p>
                        </div>
                      </div>
                    )}
                    {req.targetPrice && (
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Coins className="size-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55 mb-0.5">
                            {t('detail_page.buyer_target_price')}
                          </p>
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {Number(req.targetPrice).toLocaleString()} DA
                          </p>
                        </div>
                      </div>
                    )}
                    {req.quantity && req.quantity > 1 && (
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <Hash className="size-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55 mb-0.5">
                            {t('detail_page.quantity_needed')}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {req.quantity} units
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(req.description || req.notes) && (
                    <div className="px-5 pb-5">
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55 mb-1.5">
                            {t('offer_dialog.buyer_notes')}
                          </p>
                          <p className="text-sm text-muted-foreground/70 italic leading-relaxed bg-muted/40 px-4 py-3 rounded-lg border border-border/40 break-words overflow-wrap-anywhere">
                            &ldquo;{req.description || req.notes}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Offers ───────────────────────────────────────────── */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-muted/20">
                    <h2 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                      {t('detail_page.offers_title')}{' '}
                      <span className="text-[10px] font-normal text-muted-foreground/50">
                        {t('detail_page.ranked_by_time')}
                      </span>
                      {!quotesLoading && (
                        <span className="size-[18px] rounded-full bg-muted-foreground/15 flex items-center justify-center text-[10px] font-bold text-muted-foreground tabular-nums">
                          {total}
                        </span>
                      )}
                    </h2>
                  </div>

                  {quotesLoading ? (
                    <div className="divide-y divide-border/30">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 px-5 py-4"
                        >
                          <Skeleton className="size-7 rounded-full shrink-0" />
                          <Skeleton className="h-4 w-24 rounded" />
                          <div className="flex-1" />
                          <Skeleton className="h-4 w-16 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : sortedQuotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-14">
                      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                        <Users className="size-5 text-muted-foreground/30" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-muted-foreground/60">
                          {t('detail_page.no_offers_yet')}
                        </p>
                        <p className="text-xs text-muted-foreground/40 mt-0.5">
                          {t('detail_page.no_offers_desc')}
                        </p>
                      </div>
                      {!isInactive && (
                        <Button
                          size="sm"
                          onClick={openCreate}
                          className="h-8 px-4 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer mt-1"
                        >
                          <Plus className="size-3" />
                          {t('detail_page.submit_offer')}
                        </Button>
                      )}
                    </div>
                  ) : (
                    sortedQuotes.map((quote: any, i: number) => {
                      const isOwn = quote.sellerId === (user as any)?.id
                      return (
                        <OfferRow
                          key={quote.id ?? i}
                          quote={quote}
                          rank={i + 1}
                          isOwn={isOwn}
                          isLocked={
                            isOwn && (isInactive || quote.status !== 'pending')
                          }
                          isInactive={isInactive}
                          onEdit={() => openEdit(quote.id)}
                          onDelete={() => handleDeleteClick(quote.id)}
                          isDeleting={deletingId === quote.id}
                          t={t}
                          dateLocale={dateLocale}
                        />
                      )
                    })
                  )}

                  {total > 0 && (
                    <div className="px-5 py-3 bg-muted/10 border-t border-border/30">
                      <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1.5">
                        <Lock className="size-3 shrink-0" />
                        {t('detail_page.anonymized_notice')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT 5 cols — sticky */}
              <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-[74px]">
                {/* Image */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <ImageSlider
                    images={req.imageUrls || []}
                    aspectRatio="4/3"
                    expandable
                    className="rounded-none border-0"
                  />
                </div>

                {/* Competition */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border/40 bg-muted/20">
                    <h2 className="text-[13px] font-semibold text-foreground">
                      {t('detail_page.competition')}
                    </h2>
                  </div>
                  <div className="p-5">
                    {isInactive ? (
                      <div className="flex flex-col gap-2">
                        <span
                          className={cn(
                            'text-sm font-bold flex items-center gap-2',
                            reqStatus === 'fulfilled'
                              ? 'text-emerald-600'
                              : 'text-muted-foreground/50',
                          )}
                        >
                          <span
                            className={cn(
                              'size-2 rounded-full shrink-0',
                              reqStatus === 'fulfilled'
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground/40',
                            )}
                          />
                          {reqStatus === 'fulfilled'
                            ? t('statuses.fulfilled')
                            : t('statuses.cancelled')}
                        </span>
                        <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                          {reqStatus === 'fulfilled'
                            ? t('detail_page.competition_fulfilled')
                            : t('detail_page.competition_cancelled')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {inDiscussion > 0 ? (
                              <span className="size-2 rounded-full bg-[#0369A1] shrink-0" />
                            ) : total > 2 ? (
                              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                            ) : (
                              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                            <span
                              className={cn(
                                'text-sm font-bold',
                                inDiscussion > 0
                                  ? 'text-[#0369A1]'
                                  : total > 2
                                    ? 'text-amber-600'
                                    : 'text-emerald-600',
                              )}
                            >
                              {inDiscussion > 0
                                ? t('detail_page.competition_hot')
                                : total === 0
                                  ? t('detail_page.competition_open')
                                  : total <= 2
                                    ? t('detail_page.competition_low')
                                    : t('detail_page.competition_active')}
                            </span>
                          </div>
                          <div className="flex gap-3 text-[11px] text-muted-foreground/60 font-semibold">
                            {total > 0 && (
                              <span>
                                {t('detail_page.seller_count', {
                                  count: total,
                                })}
                              </span>
                            )}
                            {inDiscussion > 0 && (
                              <span className="text-[#0369A1]">
                                {t('detail_page.in_discussion_count', {
                                  count: inDiscussion,
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                          {total === 0
                            ? t('detail_page.competition_no_offers')
                            : inDiscussion > 0
                              ? t('detail_page.competition_in_discussion')
                              : total === 1
                                ? t('detail_page.competition_waiting', {
                                    count: 1,
                                  })
                                : t('detail_page.competition_waiting_plural', {
                                    count: total,
                                  })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      {req && (
        <footer className="border-t border-border py-8 mt-4">
          <div className="max-w-[1280px] mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-muted-foreground tracking-tight">
              MLILA Digital Hub
            </span>
            <div className="flex items-center gap-6 text-[11px] font-semibold text-muted-foreground/60">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      )}

      {/* ── Offer dialog ────────────────────────────────────────────────── */}
      <Dialog open={offerDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl max-h-[90dvh] flex flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-border/40 shrink-0">
            <DialogTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {dialogModeRef.current === 'edit'
                ? t('detail_page.dialog_update')
                : t('detail_page.dialog_submit')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <SubmitOfferTab
              requestId={requestId}
              sellerId={(user as any)?.id || ''}
              isLoading={myQuoteLoading}
              editData={dialogEditRef.current}
              showLifecycle={false}
              onSuccess={handleOfferSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation dialog ─────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogCancel}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
            <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-base font-bold tracking-tight">
                {t('alerts.withdraw_title')}
              </DialogTitle>
              <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm">
                {t('alerts.delete_confirm')}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-2">
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-xl text-sm font-semibold cursor-pointer"
                onClick={handleDeleteDialogCancel}
              >
                {t('dialog_form.cancel')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-10 rounded-xl text-sm font-semibold gap-2 cursor-pointer"
                onClick={handleDeleteConfirm}
              >
                <Trash2 className="size-4" />
                {t('alerts.withdraw_confirm_btn')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Mobile bar ──────────────────────────────────────────────────── */}
      {req && !myQuoteLoading && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 lg:hidden shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)]"
          style={{
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <Button
            onClick={openCreate}
            disabled={isInactive}
            className="w-full h-11 rounded-xl text-sm font-bold gap-2 cursor-pointer"
          >
            <Plus className="size-4" />
            {hasOwnOffer
              ? t('detail_page.mobile_add')
              : t('detail_page.mobile_submit')}
          </Button>
        </div>
      )}
    </div>
  )
}
