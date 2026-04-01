import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-card rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-center animate-in fade-in duration-500",
      className
    )}>
      <div className="size-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 shadow-sm border border-slate-100 dark:border-slate-800">
        <Icon className="size-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-2 font-medium max-w-sm">
          {description}
        </p>
      )}
    </div>
  )
}
