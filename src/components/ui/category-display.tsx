import { cn } from '@/lib/utils'
import { getCategoryImageUrl } from '@/utils/category-icons'

interface CategoryDisplayProps {
  category?: { name?: string; imageUrl?: string | null } | string | null
  className?: string
  iconClassName?: string
  showName?: boolean
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

export function CategoryDisplay({
  category,
  className,
  iconClassName,
  showName = true,
}: CategoryDisplayProps) {
  const name = typeof category === 'string' ? category : category?.name
  if (!name) return null

  const imageUrl = getCategoryImageUrl(category)
  const initials = getInitials(name)

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={cn('size-4 rounded object-contain shrink-0', iconClassName)}
        />
      ) : (
        <span className={cn(
          'size-4 rounded flex items-center justify-center text-[7px] font-bold shrink-0',
          'bg-primary/10 text-primary',
          iconClassName,
        )}>
          {initials}
        </span>
      )}
      {showName && <span>{name}</span>}
    </span>
  )
}
