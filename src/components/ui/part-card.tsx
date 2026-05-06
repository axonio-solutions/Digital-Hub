import { Clock, MapPin, ArrowUpRight, MessageSquare, Flame, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'

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
  const isAsap = status === 'premium'
  const isNew = new Date(createdAt).getTime() > Date.now() - 86400000
  const hasImage = !!imageUrls?.[0]
  const shortId = id ? String(id).substring(0, 6).toUpperCase() : 'N/A'

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden",
        "bg-card border border-border",
        "shadow-sm hover:shadow-xl hover:shadow-primary/5",
        "hover:-translate-y-1 hover:border-primary/20",
        "transition-all duration-300 ease-out",
        className
      )}
    >
      {/* Image area */}
      <div className="relative w-full h-40 bg-muted/50 shrink-0 overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrls![0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
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
          <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200" title={title}>
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
        </div>

        {/* Notes preview */}
        {notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {notes}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-medium">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{timeAgo(createdAt)}</span>
            </div>
            {region && (
              <div className="hidden sm:flex items-center gap-1 text-muted-foreground text-[10px] font-medium">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{region}</span>
              </div>
            )}
          </div>

          <span className="text-[9px] font-mono text-muted-foreground/40 hidden sm:block">
            #{shortId}
          </span>

          {/* CTA button — only rendered when actionLabel or onClick is provided */}
          {(actionLabel || onClick) && (
            <button
              type="button"
              onClick={(e) => {
                if (onClick) {
                  e.preventDefault()
                  e.stopPropagation()
                  onClick()
                }
              }}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[11px] font-bold transition-all duration-200",
                isAsap
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                  : "bg-primary text-primary-foreground hover:brightness-110 active:scale-95 shadow-sm shadow-primary/20"
              )}
            >
              {actionLabel || 'Details'}
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
