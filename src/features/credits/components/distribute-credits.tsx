'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Coins, Mail, Search, Store } from 'lucide-react'
import { useSellersWithCredits } from '../hooks/use-credits'
import { GrantCreditsDialog } from './grant-credits-dialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function DistributeCredits() {
  const { t } = useTranslation('dashboard/credits')
  const { data: sellers = [], isLoading } = useSellersWithCredits()
  const [search, setSearch] = useState('')
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return sellers
    const q = search.toLowerCase()
    return sellers.filter(
      (s: any) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.storeName?.toLowerCase().includes(q),
    )
  }, [sellers, search])

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <Skeleton className="h-10 w-full rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('distribute.search')}
          className="pl-9 h-10 rounded-xl"
        />
      </div>

      {/* Seller list */}
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm font-medium">
            {t('distribute.no_results')}
          </div>
        ) : (
          filtered.map((seller: any) => (
            <button
              key={seller.id}
              onClick={() => {
                setSelectedSeller(seller)
                setDialogOpen(true)
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors text-left group"
            >
              <Avatar className="size-10 rounded-xl shrink-0">
                <AvatarImage src={seller.image} />
                <AvatarFallback className="text-xs font-bold">
                  {seller.name?.substring(0, 2).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">
                    {seller.name || t('distribute.unknown_seller')}
                  </span>
                  {seller.storeName && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                      <Store className="size-3 shrink-0" />
                      {seller.storeName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    {seller.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <Coins className="size-4 text-amber-500" />
                    <span
                      className={cn(
                        'text-lg font-black tabular-nums',
                        seller.credits > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-muted-foreground',
                      )}
                    >
                      {seller.credits}
                    </span>
                  </div>
                </div>
                <GlowingBadge
                  variant={
                    seller.account_status === 'active'
                      ? 'success'
                      : seller.account_status === 'waitlisted'
                        ? 'warning'
                        : 'neutral'
                  }
                  className="text-[9px] uppercase"
                >
                  {t(`distribute.status.${seller.account_status || 'new'}`)}
                </GlowingBadge>
                <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </div>
            </button>
          ))
        )}
      </div>

      <GrantCreditsDialog
        seller={selectedSeller}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
