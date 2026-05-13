import React from 'react'
import { ArrowUpRight, Calendar, Clock, Flame, MessageSquare, Pencil, RefreshCcw, Sparkles, Tag, Trash2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'

const BRAND_PALETTE: Record<string, string> = {
  BMW: '#1a6eb5', Mercedes: '#1a1a1a', 'Mercedes-Benz': '#1a1a1a', Audi: '#bb161b',
  Volkswagen: '#1d5ba4', Toyota: '#e10a1a', Honda: '#0065b3', Ford: '#003478',
  Hyundai: '#002d6e', Kia: '#bb162b', Renault: '#ffcc00', Peugeot: '#003a8c',
  Citroen: '#da291c', Fiat: '#960018', Nissan: '#c3002f', Dacia: '#647687',
  'Land Rover': '#003d2e', Jaguar: '#222222', Porsche: '#b12b2b',
}

function getBrandColor(brand: string): string {
  return BRAND_PALETTE[brand] || `hsl(${brand.length * 47 + brand.charCodeAt(0) * 13 % 360}, 55%, 45%)`
}

interface PartCardProps {
  id: string
  title: string
  brand: string
  brandImageUrl?: string | null
  modelYear: string
  category?: string
  region?: string
  imageUrls?: Array<string>
  quotesCount?: number
  status?: string
  createdAt: string
  notes?: string
  actionLabel?: string
  actionHref?: string
  onClick?: () => void
  partNumber?: string
  className?: string
  onEdit?: () => void
  onClose?: () => void
  onReopen?: () => void
  onDelete?: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const PartCard = React.memo(function PartCard({
  title,
  brand,
  brandImageUrl,
  modelYear,
  category,
  region: _region,
  imageUrls,
  quotesCount = 0,
  status,
  createdAt,
  notes,
  actionLabel,
  actionHref: _actionHref,
  onClick,
  partNumber,
  className,
  onEdit,
  onClose,
  onReopen,
  onDelete,
}: PartCardProps) {
  const isAsap = status === 'premium'
  const isNew = new Date(createdAt).getTime() > Date.now() - 86400000
  const hasImage = !!imageUrls?.[0]

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden",
        "bg-card border border-border",
        "shadow-sm",
        onClick && "cursor-pointer",
        className
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-no-navigate]') || target.closest('button')) return
        onClick?.()
      }}
    >
      {/* Image area */}
      <div className="relative w-full aspect-[4/3] bg-muted/50 shrink-0 overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrls[0]}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
              <Calendar className="w-6 h-6 text-muted-foreground/40" />
            </div>
          </div>
        )}

        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top-left: quote count */}
        {quotesCount > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-sm border border-border text-foreground text-[11px] font-bold shadow-sm">
            <MessageSquare className="w-3 h-3 text-primary" />
            {quotesCount}
          </div>
        )}

        {/* Top-right: badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {isAsap && (
            <GlowingBadge variant="error" pulse className="h-6 text-[9px]">
              <Flame className="w-2.5 h-2.5 me-1" />
              ASAP
            </GlowingBadge>
          )}
          {isNew && !isAsap && (
            <GlowingBadge variant="info" pulse className="h-6 text-[9px]">
              New
            </GlowingBadge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Brand Pill */}
        <div className="flex items-center gap-2">
          <div
            className="size-[22px] rounded-md flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: brand ? getBrandColor(brand) + '20' : undefined }}
          >
            {brandImageUrl ? (
              <img src={brandImageUrl} alt={brand} className="size-4 object-contain" />
            ) : (
              <span
                className="text-[9px] font-black uppercase"
                style={{ color: brand ? getBrandColor(brand) : undefined }}
              >
                {brand ? brand.substring(0, 2) : '?'}
              </span>
            )}
          </div>
          <span
            className="text-xs font-bold uppercase tracking-tight"
            style={{ color: brand ? getBrandColor(brand) : undefined }}
          >
            {brand}
          </span>
          {modelYear && (
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground tabular-nums">
              {modelYear}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-snug" title={title}>
            {title}
          </h3>
          {partNumber && (
            <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 tracking-wide">
              PN: {partNumber}
            </p>
          )}
        </div>

        {/* Category + Status row */}
        <div className="flex items-center gap-2 flex-wrap min-h-[22px]">
          {category && (
            <span className="inline-flex items-center gap-1 h-5.5 px-2 rounded-md bg-primary/5 border border-primary/10 text-primary text-[10px] font-bold">
              <Tag className="size-2.5" />
              {category}
            </span>
          )}
          {status && (
            <span className={cn(
              "inline-flex items-center gap-1 h-5 px-2 rounded-md text-[9px] font-bold uppercase tracking-wider",
              status === 'open'
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                : status === 'fulfilled'
                  ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                  : "bg-muted border border-border text-muted-foreground"
            )}>
              <span className={cn(
                "size-1 rounded-full",
                status === 'open' ? "bg-emerald-500" : status === 'fulfilled' ? "bg-blue-500" : "bg-muted-foreground"
              )} />
              {status}
            </span>
          )}
        </div>

        {/* Notes preview */}
        {notes && (
          <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {notes}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2.5 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium min-w-0">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{timeAgo(createdAt)}</span>
            {quotesCount > 0 && (
              <span className="flex items-center gap-0.5 shrink-0 text-[10px] text-primary font-bold">
                · <MessageSquare className="w-2.5 h-2.5" />{quotesCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button data-no-navigate onClick={(e) => { e.stopPropagation(); onEdit() }} className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                <Pencil className="size-3" /> Edit
              </button>
            )}
            {onClose && (
              <button data-no-navigate onClick={(e) => { e.stopPropagation(); onClose() }} className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                <XCircle className="size-3" /> Close
              </button>
            )}
            {onReopen && (
              <button data-no-navigate onClick={(e) => { e.stopPropagation(); onReopen() }} className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                <RefreshCcw className="size-3" /> Reopen
              </button>
            )}
            {onDelete && (
              <button data-no-navigate onClick={(e) => { e.stopPropagation(); onDelete() }} className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                <Trash2 className="size-3" /> Delete
              </button>
            )}
            {!onEdit && !onClose && !onReopen && !onDelete && actionLabel && onClick && (
              <span
                data-no-navigate
                onClick={(e) => { e.stopPropagation(); onClick() }}
                className={cn(
                  'inline-flex items-center gap-1 h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all hover:brightness-110 active:scale-95',
                  actionLabel === 'Quote Now'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                    : 'bg-primary/10 text-primary border-primary/20',
                )}
              >
                {actionLabel === 'Quote Now' ? <Sparkles className="w-3 h-3" /> : <ArrowUpRight className="w-2.5 h-2.5" />}
                {actionLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
})
