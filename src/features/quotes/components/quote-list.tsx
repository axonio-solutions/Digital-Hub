'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { QuoteCard } from './quote-card'
import { cn } from '@/lib/utils'

interface QuoteListProps {
  quotes: Array<any>
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
  const { t } = useTranslation('requests/details')
  const [sortBy, setSortBy] = useState<'price' | 'recent'>('recent')

  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [quotes, sortBy])

  const quotesCount = quotes.length

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
        <h2 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2 sm:gap-3">
          {t('quotes.title', 'Offers')}
          <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-primary/10 text-primary text-xs font-black">
            {quotesCount}
          </span>
        </h2>

        {/* Sort — pill toggle on mobile, select on desktop */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="size-3.5 text-muted-foreground hidden sm:block" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">
            {t('quotes.sort_by', 'Sort')}
          </span>
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5 gap-0.5">
            <button
              onClick={() => setSortBy('recent')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors',
                sortBy === 'recent'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('quotes.sort_recent', 'Recent')}
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors',
                sortBy === 'price'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('quotes.sort_price', 'Price')}
            </button>
          </div>
        </div>
      </div>

      {/* Quote cards */}
      <div className="flex flex-col gap-3 sm:gap-4">
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
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
            <div className="size-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <MessageSquare className="size-7 text-muted-foreground/30" />
            </div>
            <h3 className="text-base font-black text-foreground uppercase tracking-tight">
              {t('quotes.empty_title', 'No offers yet')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 text-center max-w-xs">
              {t(
                'quotes.empty_desc',
                'Sellers will respond soon. Check back later or share this request.',
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
