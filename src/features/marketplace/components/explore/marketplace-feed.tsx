'use client'

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PartCard } from "@/components/ui/part-card"

interface MarketplaceFeedProps {
  requests: any[] | undefined
  isLoading: boolean
  /** Strictly typed: only available to sellers. If not a seller, pass undefined. */
  onQuote?: (request: any) => void
  onClearFilters: () => void
  userId: string | undefined
  /** Role must be 'seller' — all other values (including undefined) are treated as non-seller */
  userRole: string | undefined
}

export function MarketplaceFeed({
  requests,
  isLoading,
  onQuote,
  onClearFilters,
  userId,
  userRole,
}: MarketplaceFeedProps) {
  // RBAC: derive isSeller once — single source of truth for all guards in this component
  const isSeller = userRole === 'seller'

  const RequestSkeleton = () => (
    <Card className="flex flex-col h-full p-0 gap-0 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-[24px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] ring-0 outline-none">
      <div className="relative h-56 w-full bg-slate-50 dark:bg-slate-900/50 shrink-0 m-0 overflow-hidden rounded-t-[inherit]">
        <Skeleton className="w-full h-full bg-slate-200/50 dark:bg-slate-800/50" />
      </div>
      <CardContent className="p-6 flex flex-col flex-1 z-20 bg-white dark:bg-slate-950">
        <div className="flex justify-between items-start gap-4 mb-4">
           <div className="flex flex-col gap-2 flex-1 w-full">
             <Skeleton className="h-6 w-3/4 rounded-md bg-slate-200/50 dark:bg-slate-800/50" />
             <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded-sm bg-slate-200/50 dark:bg-slate-800/50" />
                <Skeleton className="h-4 w-20 rounded-sm bg-slate-200/50 dark:bg-slate-800/50" />
             </div>
             <Skeleton className="h-2 w-12 mt-1 rounded-sm bg-slate-200/50 dark:bg-slate-800/50" />
           </div>
           <Skeleton className="h-14 w-14 shrink-0 rounded-xl bg-slate-200/50 dark:bg-slate-800/50" />
        </div>
        <Skeleton className="h-4 w-full mb-2 bg-slate-200/50 dark:bg-slate-800/50" />
        <Skeleton className="h-4 w-2/3 mb-6 bg-slate-200/50 dark:bg-slate-800/50" />

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-md bg-slate-200/50 dark:bg-slate-800/50" />
          {/* Only show button skeleton to sellers — mirrors real DOM shape */}
          {isSeller && (
            <Skeleton className="h-10 w-28 rounded-xl bg-slate-200/50 dark:bg-slate-800/50" />
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {Array.from({ length: 6 }).map((_, i) => <RequestSkeleton key={i} />)}
      </div>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        <div className="relative w-32 h-32 mb-8 group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] group-hover:blur-[50px] transition-all duration-700" />
          <div className="relative w-full h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
            <Search className="w-12 h-12 text-slate-400 dark:text-slate-500 transition-colors duration-500 group-hover:text-primary" />
          </div>
        </div>
        <h3 className="text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tight italic">
          No matches found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium text-lg leading-relaxed">
          We couldn't find any parts matching your specific criteria. Try adjusting your filters.
        </p>
        <Button
          onClick={onClearFilters}
          className="mt-12 rounded-2xl h-14 px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
        >
          Clear All Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
      {requests.map((req) => {
        // Guard: this request belongs to the current user (buyer view)
        const isOwner = req.buyerId === userId

        // RBAC DOM Guard
        // — `actionLabel` and `onClick` are only injected into the DOM for sellers.
        // — For buyers, admins, or unauthenticated users, these props are strictly undefined
        //   which means PartCard renders no CTA button at all.
        const sellerActionLabel = isSeller && !isOwner ? 'Quote Now' : isOwner ? 'My Request' : undefined
        const sellerOnClick = isSeller && !isOwner && onQuote ? () => onQuote(req) : undefined

        return (
          <PartCard
            key={req.id}
            id={req.id}
            title={req.partName || ''}
            brand={req.vehicleBrand || ''}
            modelYear={req.modelYear || ''}
            partNumber={req.partNumber || ''}
            category={req.category?.name || req.category || ''}
            region={req.location || ''}
            imageUrls={req.imageUrls || []}
            quotesCount={req.quotesCount || req.quotes?.length || 0}
            status={req.urgency === 'asap' ? 'premium' : ''}
            createdAt={req.createdAt || new Date().toISOString()}
            actionLabel={sellerActionLabel}
            onClick={sellerOnClick}
          />
        )
      })}
    </div>
  )
}
