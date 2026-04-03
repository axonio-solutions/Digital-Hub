import { Calendar, CarFront, Clock, Eye, ImageIcon, Send } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface MarketplaceGridViewProps {
  data: Array<any>
  onAction: (item: any) => void
  type: 'opportunity' | 'active'
}

export function MarketplaceGridView({
  data,
  onAction,
  type,
}: MarketplaceGridViewProps) {
  const { t, i18n } = useTranslation('marketplace')
  const isRtl = i18n.dir() === 'rtl'

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
        <ImageIcon className="size-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">
          {t('grid.no_results')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((item) => {
        const hasImages = item.imageUrls && item.imageUrls.length > 0
        const mainImage = hasImages ? item.imageUrls[0] : null

        return (
          <Card
            key={item.id}
            className="group overflow-hidden border-muted-foreground/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={item.partName}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <ImageIcon className="size-10 text-slate-300" />
                </div>
              )}
              <div className={cn("absolute top-3 flex flex-col gap-2", isRtl ? "right-3" : "left-3")}>
                {type === 'active' ? (
                  <Badge className="bg-blue-600 text-white border-none shadow-lg gap-1.5 leading-none py-1">
                    <Clock className="size-3" />
                    {t('grid.active_badge')}
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-600 text-white border-none shadow-lg leading-none py-1">
                    {t('grid.new_badge')}
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="p-4 pb-0 text-left rtl:text-right">
              <div className="space-y-1">
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1 italic uppercase tracking-tighter">
                  {item.partName}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CarFront className="size-3.5" />
                  <p className="text-xs font-medium">
                    {item.vehicleBrand} {item.vehicleModel || ''}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-4 text-left rtl:text-right font-medium">
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  {new Date(item.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language)}
                </div>
                {item.oemNumber && (
                  <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono">
                    {t('grid.oem_prefix')} {item.oemNumber}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full gap-2 font-black uppercase text-[10px] tracking-widest"
                variant={type === 'opportunity' ? 'default' : 'secondary'}
                onClick={() => onAction(item)}
              >
                {type === 'opportunity' ? (
                  <>
                    <Send className={cn("size-4", isRtl && "rotate-180")} />
                    {t('grid.submit_btn')}
                  </>
                ) : (
                  <>
                    <Eye className="size-4" />
                    {t('grid.view_btn')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
