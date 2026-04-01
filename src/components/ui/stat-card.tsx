import { type ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  badgeText: string
  badgeColor: string
  contextText?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeColor,
  contextText = "Marketplace",
  className,
}: StatCardProps) {
  return (
    <div className={cn("p-8 flex items-start justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors", className)}>
      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </p>
        <div>
          <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">
            {value}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {contextText}
            </p>
            <Badge
              className={cn(
                "font-bold text-[10px] border-none px-2 py-0",
                badgeColor,
              )}
            >
              {badgeText}
            </Badge>
          </div>
        </div>
      </div>
      <div className="p-3 rounded-full outline outline-1 outline-slate-100 dark:outline-slate-800 text-slate-400 transition-all group-hover:scale-110 group-hover:text-primary">
        <Icon size={16} />
      </div>
    </div>
  )
}

export function StatGrid({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="p-0 shadow-xs border rounded-3xl overflow-hidden bg-white dark:bg-card">
        <div className="flex items-center w-full lg:flex-nowrap flex-wrap px-0 divide-x divide-slate-100 dark:divide-slate-800">
          {children}
        </div>
      </div>
    </div>
  )
}
