'use client'

import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PartCard } from '@/components/ui/part-card'

interface MarketplaceFeedProps {
  requests: Array<any> | undefined
  isLoading: boolean
  onQuote?: (request: any) => void
  onClearFilters: () => void
  userId: string | undefined
  userRole: string | undefined
}

function RequestSkeleton() {
  return (
    <Card className="flex flex-col h-full p-0 gap-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-40 w-full bg-muted/50 shrink-0">
        <Skeleton className="w-full h-full bg-muted" />
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-3/4 rounded-md bg-muted" />
          <Skeleton className="h-3 w-1/2 rounded-sm bg-muted" />
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-5 w-16 rounded-md bg-muted" />
            <Skeleton className="h-5 w-12 rounded-md bg-muted" />
          </div>
          <Skeleton className="h-4 w-full mt-2 rounded-md bg-muted" />
        </div>
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <Skeleton className="h-4 w-16 rounded-md bg-muted" />
          <Skeleton className="h-8 w-20 rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MarketplaceFeed({
  requests,
  isLoading,
  onQuote,
  onClearFilters,
  userId,
  userRole,
}: MarketplaceFeedProps) {
  const { t } = useTranslation('marketplace')
  const isSeller = userRole === 'seller'

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <RequestSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative w-full h-full bg-card border border-border rounded-full flex items-center justify-center shadow-sm">
            <Search className="w-10 h-10 text-muted-foreground/50" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {t('feed.no_matches')}
        </h3>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          {t('feed.no_matches_desc')}
        </p>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="mt-8 h-11 px-8 rounded-xl font-semibold border-2"
        >
          {t('feed.clear_filters')}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((req) => {
        const isOwner = req.buyerId === userId
        const sellerActionLabel =
          isSeller && !isOwner
            ? t('feed.quote_now')
            : isOwner
              ? t('feed.my_request')
              : undefined
        const sellerOnClick =
          isSeller && !isOwner && onQuote ? () => onQuote(req) : undefined

        return (
          <PartCard
            key={req.id}
            id={req.id}
            title={req.partName || ''}
            brand={req.vehicleBrand || ''}
            brandImageUrl={req.brand?.imageUrl}
            modelYear={req.modelYear || ''}
            partNumber={req.partNumber || ''}
            category={req.category?.name || req.category || ''}
            categoryImageUrl={req.category?.imageUrl}
            notes={req.notes || req.description || ''}
            region={req.location || ''}
            imageUrls={req.imageUrls || []}
            quotesCount={req.quotesCount || req.quotes?.length || 0}
            status={req.status || (req.urgency === 'asap' ? 'open' : '')}
            createdAt={req.createdAt || new Date().toISOString()}
            actionLabel={sellerActionLabel}
            onClick={sellerOnClick}
          />
        )
      })}
    </div>
  )
}
