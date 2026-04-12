import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { Hash, History, Layers, MessageSquare } from 'lucide-react'
import { tCategory } from '@/utils/category-utils'

interface RequestDetailsCompactProps {
  request: any
}

export function RequestDetailsCompact({ request }: RequestDetailsCompactProps) {
  const { t } = useTranslation('marketplace')
  if (!request) return null

  const timeAgo = request.createdAt 
    ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true }) 
    : ''

  return (
    <div className="relative group overflow-hidden">
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md transition-all duration-300">
        {/* Brand & Year */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5 flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> Vehicle
            </span>
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
              {request.vehicleBrand}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/20 dark:bg-primary/40" />
              {request.modelYear}
            </div>
          </div>
        </div>

        {/* Part Name & Category */}
        <div className="flex-1 min-w-[180px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5">Demand Signal</span>
          <div className="flex flex-col">
            <h3 className="text-base font-black uppercase italic tracking-tight text-primary leading-tight mb-1">
              {request.partName}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                {tCategory(request.category?.name || request.category || request.categoryId, t)}
              </span>
              {request.oemNumber && (
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{request.oemNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div className="flex items-center gap-6 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5 flex items-center gap-1">
              <History className="w-2.5 h-2.5" /> Published
            </span>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 capitalize">
              {timeAgo}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-2.5 h-2.5" /> Traction
            </span>
            <span className="text-[11px] font-bold text-slate-900 dark:text-white">
              {request.quotes?.length || 0} {t('statuses.pending')}
            </span>
          </div>

          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5 flex items-center gap-1">
              <Hash className="w-2.5 h-2.5" /> Network ID
            </span>
            <code className="text-[10px] font-mono font-bold text-slate-500 opacity-60">
              {request.id?.substring(0, 8).toUpperCase()}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
