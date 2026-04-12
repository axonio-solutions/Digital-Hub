import { ArrowUpRight, CarFront, Clock, FileText, MapPin, Sparkles, Tag } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatRelativeTime } from "@/lib/utils/date-format"
import { cn } from "@/lib/utils"
import { tCategory } from "@/utils/category-utils"

interface RequestCardProps {
  request: any
  onQuote: (request: any) => void
  isOwner?: boolean
}

export function RequestCard({ request, onQuote, isOwner }: RequestCardProps) {
  const { t } = useTranslation('marketplace')

  return (
    <Card
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:border-primary/30"
    >
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden">
        {request.imageUrls?.[0] ? (
          <img
            src={request.imageUrls[0]}
            alt={request.partName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <FileText className="size-12 text-slate-200 dark:text-slate-800" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-4 inset-x-4 flex items-start justify-between">
          <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md border-none px-3 py-1.5 rounded-full font-bold shadow-sm">
            {tCategory(request.category?.name || request.category, t)}
          </Badge>
          
          {request.urgency === 'asap' && (
            <Badge className="bg-red-500 text-white border-none px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg shadow-red-500/30">
              {t('filters.urgency', { defaultValue: 'ASAP' })}
            </Badge>
          )}
        </div>

        {/* Floating Info Overlay */}
        <div className="absolute bottom-4 inset-x-4 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
           <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                 <MapPin className="size-4 text-white" />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{request.location || 'Algeria'}</span>
           </div>
           <Badge className="bg-emerald-500 text-white border-none text-[10px] font-black py-0.5">
             ACTIVE
           </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex flex-col gap-1 mb-5">
          <div className="flex items-center justify-between">
             <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 italic">
               {request.partName}
             </h4>
             <ArrowUpRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Tag className="size-3" />
            {request.oemNumber && `OEM: ${request.oemNumber}`}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group/item transition-colors hover:bg-slate-100 dark:hover:bg-slate-900">
            <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
              <CarFront className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vehicle Specification</div>
              <div className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                {request.vehicleBrand} {request.vehicleModel || ''}
              </div>
              <div className="text-xs font-bold text-slate-500">{request.modelYear} Model</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Clock className="size-3" />
              {formatRelativeTime(request.createdAt)}
            </div>
            
            {(request.quotesCount > 0 || request.quotes?.length > 0) && (
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('card.quotes_count', { count: request.quotesCount || request.quotes?.length || 0 })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            onClick={() => onQuote(request)}
            disabled={isOwner}
            className={cn(
              "w-full rounded-2xl h-14 font-black uppercase tracking-[0.15em] text-xs transition-all duration-300 active:scale-[0.98]",
              isOwner 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-none cursor-not-allowed"
                : "bg-primary hover:bg-primary-hover text-white shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)]"
            )}
          >
            {isOwner ? t('card.my_request') : (
              <div className="flex items-center justify-center gap-3">
                {t('card.quote_now')}
                <Sparkles className="size-4 animate-pulse" />
              </div>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
    </Card>
  )
}
