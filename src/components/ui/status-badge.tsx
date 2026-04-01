import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    archived: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
  }

  const dots: any = {
    active: 'bg-emerald-500',
    draft: 'bg-slate-400',
    archived: 'bg-amber-500',
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-noto", styles[status])}>
      <span className={cn("size-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  )
}
