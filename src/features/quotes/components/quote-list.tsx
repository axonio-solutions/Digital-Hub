'use client'

import { useState, useMemo } from 'react'
import { MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { QuoteCard } from './quote-card'

interface QuoteListProps {
  quotes: any[]
  isRequestOpen: boolean
  onAccept: (quoteId: string) => void
  onReject: (quoteId: string) => void
  onUnreject: (quoteId: string) => void
  onRevoke: (quoteId: string) => void
  onContact: (seller: any) => void
  isAccepting?: boolean
  isRejecting?: boolean
  isUnrejecting?: boolean
  isRevoking?: boolean
  processingQuoteId?: string | null
}

export function QuoteList({
  quotes,
  isRequestOpen,
  onAccept,
  onReject,
  onUnreject,
  onRevoke,
  onContact,
  isAccepting = false,
  isRejecting = false,
  isUnrejecting = false,
  isRevoking = false,
  processingQuoteId = null,
}: QuoteListProps) {
  const [sortBy, setSortBy] = useState<'price' | 'recent'>('recent')

  const sortedQuotes = useMemo(() => {
    if (!quotes) return []
    return [...quotes].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [quotes, sortBy])

  const quotesCount = quotes?.length || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
          Offers Received
          <Badge className="bg-primary/10 text-primary border-none text-sm px-2.5 h-6 font-black rounded-full">
            {quotesCount}
          </Badge>
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'recent')}
            className="bg-secondary dark:bg-muted border-border text-xs font-bold rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none cursor-pointer tracking-wide"
          >
            <option value="recent">Most Recent</option>
            <option value="price">Lowest Price</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quotesCount > 0 ? (
          sortedQuotes.map((quote) => (
            <QuoteCard
                key={quote.id}
                quote={quote}
                isRequestOpen={isRequestOpen}
                onAccept={onAccept}
                onReject={onReject}
                onUnreject={onUnreject}
                onRevoke={onRevoke}
                onContact={onContact}
                isAccepting={isAccepting && processingQuoteId === quote.id}
                isRejecting={isRejecting && processingQuoteId === quote.id}
                isUnrejecting={isUnrejecting && processingQuoteId === quote.id}
                isRevoking={isRevoking && processingQuoteId === quote.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-card rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800/50">
            <div className="size-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
              <MessageSquare className="size-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">No Offers Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">We'll notify you as soon as sellers start responding.</p>
          </div>
        )}
      </div>
    </div>
  )
}
