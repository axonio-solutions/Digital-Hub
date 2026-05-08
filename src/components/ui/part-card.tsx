import React from 'react'
import { ArrowUpRight, Calendar, Clock, Flame, MessageSquare, Pencil, RefreshCcw, Trash2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'

interface PartCardProps {
  id: string
  title: string
  brand: string
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
  modelYear,
  category,
  region: _region,
  imageUrls,
  quotesCount = 0,
  status,
  createdAt,
  notes,
  actionLabel: _actionLabel,
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
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground line-clamp-1" title={title}>
            {title}
          </h3>
          {partNumber && (
            <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 tracking-wide">
              PN: {partNumber}
            </p>
          )}
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center h-5.5 px-2 rounded-md bg-foreground/10 text-foreground text-[10px] font-bold">
            {brand}
          </span>
          {modelYear && (
            <span className="inline-flex items-center h-5.5 px-2 rounded-md bg-muted border border-border text-muted-foreground text-[10px] font-semibold">
              {modelYear}
            </span>
          )}
          {category && (
            <span className="inline-flex items-center h-5.5 px-2 rounded-md bg-muted border border-border text-muted-foreground text-[10px] font-medium capitalize">
              {category}
            </span>
          )}
          {status && (
            <span className={cn(
              "inline-flex items-center h-5.5 px-2 rounded-md text-[10px] font-bold capitalize",
              status === 'open'
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                : status === 'fulfilled'
                  ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                  : "bg-muted border border-border text-muted-foreground"
            )}>
              {status}
            </span>
          )}
        </div>

        {/* Notes preview */}
        {notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {notes}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
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
            {!onEdit && !onClose && !onReopen && !onDelete && onClick && (
              <span data-no-navigate onClick={(e) => { e.stopPropagation(); onClick() }} className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 cursor-pointer">
                Details <ArrowUpRight className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
})
