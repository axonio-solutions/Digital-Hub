'use client'

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PartCard } from "./part-card"

interface MarketplaceFeedProps {
  requests: any[] | undefined
  isLoading: boolean
  onQuote: (request: any) => void
  onClearFilters: () => void
  userId: string | undefined
  isAuthenticated: boolean
}

export function MarketplaceFeed({
  requests,
  isLoading,
  onQuote,
  onClearFilters,
  userId,
  isAuthenticated
}: MarketplaceFeedProps) {

  const RequestSkeleton = () => (
    <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col h-full">
      <div className="relative h-56 w-full">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-8 flex flex-col flex-1 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-14 w-32 rounded-2xl" />
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
      <div className="py-32 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-300 shadow-inner">
          <Search className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight italic">No results matched your search</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        <Button 
          onClick={onClearFilters}
          className="mt-10 rounded-2xl h-12 px-10 bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
        >
          Clear All Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
      {requests.map((req) => (
        <PartCard
          key={req.id}
          request={req}
          isOwner={req.buyerId === userId}
          onQuote={onQuote}
        />
      ))}
    </div>
  )
}
