'use client'

import { PartCard } from '@/components/ui/part-card'
import { Car } from 'lucide-react'

interface RequestsGridViewProps {
  data: Array<any>
  onAction?: (action: { type: string, item: any }) => void
}

export function BuyerGridView({ data, onAction }: RequestsGridViewProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/5 border-muted-foreground/10">
        <Car className="size-12 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground">No demands found in this view.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((req) => (
        <PartCard
          key={req.id}
          id={req.id}
          title={req.partName}
          brand={req.vehicleBrand || req.brand?.brand}
          modelYear={req.modelYear}
          category={req.category?.name}
          region={req.brand?.clusterRegion}
          imageUrls={req.imageUrls}
          quotesCount={req.quotes?.length}
          status={req.status}
          createdAt={req.createdAt}
          notes={req.notes}
          actionHref="/dashboard/requests/$requestId"
          onClick={() => onAction?.({ type: 'view_request', item: req })}
        />
      ))}
    </div>
  )
}
