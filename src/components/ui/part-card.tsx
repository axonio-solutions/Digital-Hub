import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpRight,
  Car,
  Clock,
  Cpu,
  FileText,
  Loader2,
  MessageSquare,
  Pencil,
  RefreshCcw,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CategoryDisplay } from '@/components/ui/category-display'
import { tCategory } from '@/utils/category-utils'

interface PartCardProps {
  id: string
  title: string
  brand: string
  brandImageUrl?: string | null
  modelYear: string
  category?: string
  categoryImageUrl?: string | null
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
  isProcessing?: boolean
}

function timeAgo(dateStr: string, t: (key: string, options?: any) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return t('part_card.minutes_ago', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('part_card.hours_ago', { count: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('part_card.days_ago', { count: days })
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getBrandInitials(brand?: string): string {
  if (!brand) return '?'
  const parts = brand.split(/\s+/)
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return brand.substring(0, 2).toUpperCase()
}

function getStatusBadge(t: (key: string, options?: any) => string) {
  return {
    open: {
      label: t('part_card.open'),
      dot: 'bg-green-500',
      bg: 'bg-green-100 dark:bg-green-950',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    fulfilled: {
      label: t('part_card.fulfilled'),
      dot: 'bg-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-950',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    cancelled: {
      label: t('part_card.cancelled'),
      dot: 'bg-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    },
  }
}

export const PartCard = React.memo(function PartCard({
  title,
  brand,
  brandImageUrl,
  modelYear,
  category,
  imageUrls,
  status,
  createdAt,
  notes,
  actionLabel,
  onClick,
  className,
  onEdit,
  onClose,
  onReopen,
  onDelete,
  isProcessing,
  categoryImageUrl,
  quotesCount,
}: PartCardProps) {
  const { t } = useTranslation('common')
  const hasImage = !!imageUrls?.[0]
  const cfg = status ? getStatusBadge(t)[status] : undefined
  const brandInitials = getBrandInitials(brand)

  return (
    <div
      className={cn(
        'bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-no-navigate]') || target.closest('button')) return
        onClick?.()
      }}
    >
      {/* Image */}
      <div className="relative h-56 sm:h-64 bg-muted/50 overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrls[0]}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="size-12 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
              <Cpu className="size-6 text-muted-foreground/40" />
            </div>
          </div>
        )}

        {brand && (
          <Badge className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-border shadow-sm gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-foreground rtl:flex-row-reverse">
            {brandImageUrl ? (
              <img src={brandImageUrl} alt={brand} className="size-5 object-contain shrink-0" />
            ) : (
              <span className="size-5 rounded flex items-center justify-center bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-[9px] font-bold shrink-0">
                {brandInitials}
              </span>
            )}
            <span className="truncate max-w-[100px]">{brand}</span>
          </Badge>
        )}

        {category && (
          <Badge className="absolute top-4 right-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-border shadow-sm gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-foreground rtl:flex-row-reverse group transition-all duration-300">
            <CategoryDisplay
              category={categoryImageUrl ? { name: category, imageUrl: categoryImageUrl } : category}
              showName={false}
              iconClassName="size-5"
            />
            <span className="truncate max-w-[100px] group-hover:max-w-[250px] transition-[max-width] duration-300 ease-in-out">{tCategory(category, t)}</span>
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Status + Time */}
        <div className="flex items-center justify-between mb-5">
          {cfg ? (
            <span className="inline-flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border',
                  cfg.bg,
                  cfg.text,
                  cfg.border,
                )}
              >
                <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
                {cfg.label}
              </span>
              {quotesCount > 0 && (
                <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1" dir="ltr">
                  <MessageSquare className="size-3" />
                  {quotesCount}
                </span>
              )}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5" />
            {t('part_card.updated')} {timeAgo(createdAt, t)}
          </span>
        </div>

        {/* Title + Brand + Notes block */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground leading-tight break-words line-clamp-2" title={title}>
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary min-w-0">
            <Car className="size-4 shrink-0" />
            <span className="truncate">{modelYear}</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium pt-1 leading-relaxed flex items-start gap-1.5">
            <FileText className="size-4 mt-0.5 shrink-0 text-muted-foreground/50" />
            <span className="line-clamp-2">{notes || t('part_card.no_description')}</span>
          </p>
        </div>

        {/* Actions — pushed to bottom when cards have varying content */}
        <div className="mt-auto pt-5">
          <Separator className="mb-5" />
          <div className="flex items-center gap-3">
          {onEdit && onClose && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                disabled={isProcessing}
                data-no-navigate
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium"
              >
                {isProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Pencil className="size-4" />
                )}
                {t('part_card.edit')}
              </Button>
              <Button
                variant="outline"
                disabled={isProcessing}
                data-no-navigate
                onClick={(e) => { e.stopPropagation(); onClose() }}
                className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
              >
                {isProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                {t('part_card.close')}
              </Button>
            </div>
          )}
          {onEdit && !onClose && (
            <Button
              disabled={isProcessing}
              data-no-navigate
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium"
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
              {t('part_card.edit')}
            </Button>
          )}
          {onClose && !onEdit && (
            <Button
              variant="outline"
              disabled={isProcessing}
              data-no-navigate
              onClick={(e) => { e.stopPropagation(); onClose() }}
              className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              {t('part_card.close')}
            </Button>
          )}
          {onReopen && (
            <Button
              variant="outline"
              disabled={isProcessing}
              data-no-navigate
              onClick={(e) => { e.stopPropagation(); onReopen() }}
              className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
                {t('part_card.reopen')}
              </Button>
            )}
            {!onEdit && !onClose && !onReopen && actionLabel && onClick && (
              <Button
                size="default"
                data-no-navigate
                onClick={(e) => { e.stopPropagation(); onClick() }}
                className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium"
              >
                {actionLabel === 'Quote Now' ? (
                  <Sparkles className="size-4" />
                ) : (
                  <ArrowUpRight className="size-4" />
                )}
                {actionLabel === 'Quote Now' ? t('part_card.quote_now') : actionLabel}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              disabled={isProcessing}
              data-no-navigate
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="size-10 shrink-0 rounded-lg border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  )
})
