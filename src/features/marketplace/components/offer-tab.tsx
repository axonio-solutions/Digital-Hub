'use client'

import {
  BadgeCheck,
  Edit3,
  EyeOff,
  ShieldCheck,
  Store,
  TrendingUp,
} from 'lucide-react'
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from '@/components/ui/stat'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface OfferTabProps {
  quotes: any[]
  isLoading: boolean
  currentSellerId?: string
  onEditOffer?: (quote: any) => void
}

export function OfferTab({
  quotes = [],
  isLoading,
  currentSellerId,
  onEditOffer,
}: OfferTabProps) {
  const inDiscussion = quotes.filter((q) => q.status === 'accepted')
  const pending = quotes.filter((q) => q.status === 'pending')
  const total = quotes.length

  const getColor = (border: string) => {
    if (border.includes('primary')) return 'info' as const
    if (border.includes('blue')) return 'info' as const
    if (border.includes('amber')) return 'warning' as const
    return 'default' as const
  }

  const statsCards = [
    {
      count: total,
      label: 'Total Offers',
      bg: 'bg-gradient-to-br from-primary/[0.04] to-transparent',
      border: 'border-primary/10',
      textColor: 'text-[#0F172A]',
      accent: 'bg-primary/10',
    },
    {
      count: inDiscussion.length,
      label: 'In Discussion',
      bg: 'bg-gradient-to-br from-blue-50 to-transparent',
      border: 'border-blue-200/50',
      textColor: 'text-[#0369A1]',
      accent: 'bg-blue-100',
    },
    {
      count: pending.length,
      label: 'Pending',
      bg: 'bg-gradient-to-br from-amber-50 to-transparent',
      border: 'border-amber-200/50',
      textColor: 'text-amber-700',
      accent: 'bg-amber-100',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Mobile */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              'relative p-4 rounded-xl border transition-all duration-200',
              card.bg,
              card.border,
              'hover:shadow-sm',
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                {card.label}
              </p>
              <div
                className={cn(
                  'w-5 h-5 rounded flex items-center justify-center',
                  card.accent,
                )}
              >
                <TrendingUp className="w-2.5 h-2.5 text-muted-foreground/40" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-7 w-12 rounded bg-muted-foreground/10 animate-pulse" />
            ) : (
              <p
                className={cn(
                  'text-xl font-bold tracking-tight',
                  card.textColor,
                )}
              >
                {card.count}
              </p>
            )}
          </div>
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-3 gap-3">
        {statsCards.map((card) => (
          <Stat key={card.label}>
            <StatLabel>{card.label}</StatLabel>
            <StatIndicator variant="icon" color={getColor(card.border)}>
              <TrendingUp />
            </StatIndicator>
            <StatValue>{card.count}</StatValue>
          </Stat>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
              All Offers
            </h3>
            {!isLoading && (
              <span className="text-[10px] font-mono font-bold text-muted-foreground/30 bg-muted/50 px-1.5 py-0.5 rounded-full border border-border/40">
                {quotes.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/10 animate-pulse"
                >
                  <div className="h-5 w-24 rounded-full bg-muted-foreground/10" />
                  <div className="h-3 w-16 rounded bg-muted-foreground/10" />
                </div>
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/40 bg-muted/5 py-6 text-center">
              <EyeOff className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground/20" />
              <p className="text-xs text-muted-foreground/50 font-medium">
                No offers yet.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30 bg-card">
              {quotes.map((item) => {
                const isAccepted = item.status === 'accepted'
                const isOwn = item.sellerId === currentSellerId
                const storeName = isOwn
                  ? 'You'
                  : item.seller?.storeName || 'Unknown Store'
                const date = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-DZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : ''
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between p-3.5 transition-colors duration-150',
                      isOwn &&
                        'bg-gradient-to-r from-primary/[0.02] to-transparent hover:from-primary/[0.04]',
                      'hover:bg-muted/20',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 leading-none',
                          isAccepted
                            ? 'bg-blue-50 text-[#0369A1] border-blue-200/50'
                            : 'bg-amber-50 text-amber-700 border-amber-200/50',
                        )}
                      >
                        {isAccepted ? 'In Discussion' : 'Pending'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            'text-xs font-semibold flex items-center gap-1',
                            isOwn ? 'text-primary' : 'text-foreground',
                          )}
                        >
                          <Store className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                          {storeName}
                        </span>
                        {date && (
                          <span className="text-[10px] text-muted-foreground/50">
                            {date}
                          </span>
                        )}
                      </div>
                    </div>

                    {isOwn ? (
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-wider flex items-center gap-1 justify-end">
                            <BadgeCheck className="w-3 h-3" />
                            Condition
                          </p>
                          <p className="text-xs font-semibold text-foreground">
                            {item.condition === 'new' ? 'New (OEM)' : 'Used'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-wider flex items-center gap-1 justify-end">
                            <ShieldCheck className="w-3 h-3" />
                            Warranty
                          </p>
                          <p className="text-xs font-semibold text-foreground">
                            {item.warranty || '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-wider">
                            Price
                          </p>
                          <p className="text-sm font-bold font-mono text-foreground">
                            {item.price?.toLocaleString() || '—'}
                            <span className="text-xs text-muted-foreground/50 ml-0.5">
                              DA
                            </span>
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="xs"
                          className="gap-1 text-[10px] font-bold h-7 px-2.5 shrink-0 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:text-primary"
                          onClick={() => onEditOffer?.(item)}
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <p className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-wider flex items-center gap-1 justify-end">
                            <BadgeCheck className="w-2.5 h-2.5" />
                            Condition
                          </p>
                          <p className="text-[11px] font-mono font-bold text-muted-foreground/20 blur-[3px] select-none">
                            {'\u2022'.repeat(3)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-wider flex items-center gap-1 justify-end">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Warranty
                          </p>
                          <p className="text-[11px] font-mono font-bold text-muted-foreground/20 blur-[3px] select-none">
                            {'\u2022'.repeat(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-wider">
                            Price
                          </p>
                          <p className="text-[11px] font-mono font-bold text-muted-foreground/20 blur-[3px] select-none">
                            {'\u2022'.repeat(6)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {total > 0 && (
            <p className="text-[10px] text-muted-foreground/40 italic flex items-center gap-1.5 pt-1.5">
              <EyeOff className="w-3 h-3 shrink-0 text-muted-foreground/30" />
              Competitor details are anonymized to ensure fair bidding.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
