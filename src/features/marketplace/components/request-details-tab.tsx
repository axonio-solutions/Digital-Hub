'use client'

import { Car, Hash, MapPin, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CategoryDisplay } from '@/components/ui/category-display'
import { ImageSlider } from '@/components/ui/image-slider'
import { tCategory } from '@/utils/category-utils'

interface RequestDetailsTabProps {
  request: any
}

export function RequestDetailsTab({ request }: RequestDetailsTabProps) {
  const { t } = useTranslation('marketplace')

  if (!request) return null

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative group rounded-lg overflow-hidden">
            <ImageSlider images={request.imageUrls || []} aspectRatio="4/3" />
            {request.isPriority && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-destructive/20 shadow-sm backdrop-blur-sm">
                  <Zap className="w-3 h-3 fill-current shrink-0" />
                  PRIORITY: ASAP
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground leading-tight tracking-tight">
              {request.partName}
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                  Vehicle
                </p>
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  {request.vehicleBrand} {request.modelYear}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                  OEM Number
                </p>
                <p className="font-mono font-bold text-primary flex items-center gap-1.5">
                  <Hash className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                  {request.oemNumber || '-'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                  Location
                </p>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                  {request.location || 'Algiers, DZ'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                  Category
                </p>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <CategoryDisplay
                    category={request.category?.name || request.category}
                    showName={false}
                    iconClassName="size-3.5 text-primary/60"
                  />
                  <span>
                    {tCategory(
                      request.category?.name ||
                        request.category ||
                        request.categoryId,
                      t,
                    )}
                  </span>
                </p>
              </div>
            </div>
            {request.notes && (
              <div className="pt-6 border-t border-border/60">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2.5">
                  Buyer Notes
                </p>
                <div className="bg-muted/30 p-4 rounded-lg border-l-[3px] border-primary/30 italic text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{request.notes}&rdquo;
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
