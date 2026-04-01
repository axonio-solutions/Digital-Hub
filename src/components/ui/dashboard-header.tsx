import { type ReactNode } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title: string
  description: string
  showDate?: boolean
  actions?: ReactNode
  className?: string
}

export function DashboardHeader({
  title,
  description,
  showDate = true,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6", className)}>
      <div className="flex-1 space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic">
          {description}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {showDate && (
          <div className="hidden sm:block text-right pr-4 border-r border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Current Date
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white tracking-tighter">
              {format(new Date(), 'MMMM dd, yyyy')}
            </p>
          </div>
        )}
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
