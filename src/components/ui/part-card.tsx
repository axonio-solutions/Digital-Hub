import { Clock, Package, Layers, MapPin, ArrowUpRight, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { GlowingBadge } from "@/components/unlumen-ui/glowing-badge";

interface PartCardProps {
  id: string
  title: string
  brand: string
  modelYear: string
  category?: string
  region?: string
  imageUrls?: string[]
  quotesCount?: number
  status?: string
  createdAt: string
  notes?: string
  actionLabel?: string
  actionHref?: string
  onClick?: () => void
  partNumber?: string
  className?: string
}

export function PartCard({
  id,
  title,
  brand,
  modelYear,
  category,
  region,
  imageUrls,
  quotesCount = 0,
  status,
  createdAt,
  notes,
  actionLabel,
  actionHref,
  onClick,
  partNumber,
  className,
}: PartCardProps) {
  const { t } = useTranslation('requests/card')

  const isNew = new Date(createdAt).getTime() > Date.now() - 86400000
  const isAsap = status === 'premium'
  const hasImage = !!imageUrls?.[0]
  const shortId = id ? String(id).substring(0, 6).toUpperCase() : 'N/A'

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  const actionNode = (actionHref || onClick) && (
    <button
      id={`part-card-action-${id}`}
      type="button"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault()
          e.stopPropagation()
          onClick()
        }
      }}
      className={cn(
        "group/btn relative flex items-center gap-2 h-9 px-4 rounded-full text-[11px] font-black tracking-widest uppercase",
        "bg-primary text-primary-foreground",
        "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] shadow-primary/40",
        "hover:shadow-[0_6px_28px_-4px_rgba(0,0,0,0.35)] hover:shadow-primary/50",
        "hover:brightness-110 active:scale-95 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      )}
    >
      {actionLabel || t('actions.details', 'Details')}
      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
    </button>
  )

  return (
    <article
      className={cn(
        // Shell
        "group relative flex flex-col rounded-[20px] overflow-hidden",
        "bg-white dark:bg-slate-900",
        "border border-slate-200/80 dark:border-slate-800/80",
        // Hover elevation
        "shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)]",
        "hover:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)]",
        "hover:-translate-y-1.5 hover:border-primary/30 dark:hover:border-primary/25",
        "transition-all duration-350 ease-out",
        className
      )}
    >
      {/* ── Image / Placeholder ─────────────────────────────────────────────── */}
      <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrls![0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          // Placeholder: abstract colored gradient that still looks intentional
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <Package className="w-7 h-7 text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              No Image
            </span>
          </div>
        )}

        {/* Scrim – only visible when image is present */}
        {hasImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
        )}

        {/* ── Top-right badges ──────────────────────────────────────────────── */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          {isAsap && (
            <GlowingBadge
              variant="error"
              pulse
              className="h-6 text-[9px]"
            >
              <Flame className="w-2.5 h-2.5 me-1" />
              ASAP
            </GlowingBadge>
          )}
          {isNew && (
            <GlowingBadge
              variant="info"
              pulse
              className="h-6 text-[9px]"
            >
              New
            </GlowingBadge>
          )}
        </div>

        {/* ── Bottom-left: Quote count chip (over image) ────────────────────── */}
        {quotesCount > 0 && (
          <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black tracking-wider uppercase shadow-sm">
            <span className="text-[11px] font-black leading-none">{quotesCount}</span>
            {t('labels.quotes', 'Quotes')}
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="text-[15px] font-bold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-primary transition-colors duration-200"
              title={title}
            >
              {title}
            </h3>
            {partNumber && (
              <p className="text-[10px] font-mono font-semibold text-primary/70 dark:text-primary/60 mt-0.5 tracking-wider">
                PN: {partNumber}
              </p>
            )}
          </div>

          {/* Year badge */}
          <span className="flex-shrink-0 inline-flex items-center h-6 px-2 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider">
            {modelYear}
          </span>
        </div>

        {/* Meta chips row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Brand */}
          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider">
            {brand}
          </span>

          {/* Category */}
          {category && (
            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-semibold capitalize">
              <Layers className="w-2.5 h-2.5" />
              {category}
            </span>
          )}

          {/* Region */}
          {region && (
            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
              <MapPin className="w-2.5 h-2.5" />
              {region}
            </span>
          )}
        </div>

        {/* Notes */}
        {notes && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed -mt-1">
            {notes}
          </p>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {/* Date + ID */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{formattedDate}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-300 dark:text-slate-600 tracking-widest">
              #{shortId}
            </span>
          </div>

          {/* CTA — only rendered when `actionLabel` or `onClick` is provided (RBAC guard upstream) */}
          {actionHref ? (
            <Link
              to={actionHref as any}
              params={id ? ({ requestId: id } as any) : undefined}
              className="contents"
            >
              {actionNode}
            </Link>
          ) : (
            actionNode
          )}
        </div>
      </div>
    </article>
  )
}
