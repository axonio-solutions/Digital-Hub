import { formatDistanceToNow } from 'date-fns'
import { arDZ, fr, enUS } from 'date-fns/locale'
import {
  Clock,
  Eye,
  ImageIcon,
  MapPin,
  MoreVertical,
  Send,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { tCategory } from '@/utils/category-utils'
import { cn } from '@/lib/utils'

const dateLocaleMap: Record<string, any> = {
  ar: arDZ,
  fr: fr,
  en: enUS,
}

interface MarketplaceListViewProps {
  data: Array<any>
  onAction: (item: any) => void
  type: 'opportunity' | 'active'
}

export function MarketplaceListView({
  data,
  onAction,
  type,
}: MarketplaceListViewProps) {
  const { t, i18n } = useTranslation('marketplace')
  const currentLocale = dateLocaleMap[i18n.language] || enUS
  const isRtl = i18n.dir() === 'rtl'

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
        <ImageIcon className="size-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">
          {t('list.no_results')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((item) => {
        const hasImages = item.imageUrls && item.imageUrls.length > 0
        const mainImage = hasImages ? item.imageUrls[0] : null
        
        return (
          <div 
            key={item.id}
            className="group flex flex-col sm:flex-row gap-4 p-3.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200"
          >
            {/* Image Area */}
            <div className="relative shrink-0 w-full sm:w-40 h-40 sm:h-32 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark">
              {mainImage ? (
                <img 
                  alt={item.partName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={mainImage}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="size-8 text-muted-foreground/20" />
                </div>
              )}
              {hasImages && (
                <div className={cn(
                  "absolute top-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded",
                  isRtl ? "right-1.5" : "left-1.5"
                )}>
                  {item.imageUrls.length}
                </div>
              )}
              {item.isNew && (
                <div className={cn(
                  "absolute top-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse",
                  isRtl ? "left-1.5" : "right-1.5"
                )}>
                  {t('list.new')}
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1 text-left rtl:text-right">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none text-[9px] font-bold uppercase tracking-wide px-1.5 py-0 h-4 w-fit">
                      {tCategory(item.category?.name || item.category, t)}
                    </Badge>
                    <span className="text-text-sec-light dark:text-text-sec-dark text-[11px] flex items-center gap-1">
                      <MapPin className="size-2.5" /> {item.location || t('list.algiers')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-main-light dark:text-text-main-dark leading-tight mb-0.5 truncate">
                    {item.partName}
                  </h3>
                  <p className="text-[13px] font-semibold text-text-sec-light dark:text-text-sec-dark mb-1">
                    {item.vehicleBrand} {item.vehicleModel} ({item.modelYear})
                  </p>
                  <p className="text-[13px] text-text-main-light dark:text-text-main-dark line-clamp-2 leading-snug opacity-90">
                    {item.description || t('list.no_description')}
                    {item.oemNumber && ` • ${t('grid.oem_prefix')} ${item.oemNumber}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-text-sec-light dark:text-text-sec-dark size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-auto pt-3 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-medium text-text-sec-light dark:text-text-sec-dark">
                  <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded">
                    <Clock className="size-2.5" /> 
                    {formatDistanceToNow(new Date(item.createdAt), {
                      locale: currentLocale,
                      addSuffix: true
                    })}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded">
                    <Eye className="size-2.5" /> {item.viewCount || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-8 px-3 text-[12px] font-bold border-border-light dark:border-border-dark">
                    {t('list.ignore')}
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 sm:flex-none h-8 px-4 bg-primary hover:bg-primary-dark text-white text-[12px] font-bold shadow-md transition-all gap-1.5"
                    onClick={() => onAction(item)}
                  >
                    <span>{type === 'opportunity' ? t('list.send_offer') : t('list.view_quote')}</span>
                    <Send className={cn("size-3.5", isRtl && "rotate-180")} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
