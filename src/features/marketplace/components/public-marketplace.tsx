'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, LayoutGrid, LayoutList, Sparkles } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { usePublicOpenRequests, usePublicTaxonomy } from '@/features/requests/hooks/use-requests'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { SendOfferDialog } from './send-offer-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

import { CategoryBar } from './explore/category-bar'
import { MarketplaceFeed } from './explore/marketplace-feed'

export function PublicMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrands, setSelectedBrands] = useState<Array<string>>([])
  const [urgency, setUrgency] = useState('any')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [sortOption, setSortOption] = useState('newest')

  const { t } = useTranslation(['home/explore', 'marketplace'])

  const { data: user } = useAuth()
  const isAuthenticated = !!user
  const navigate = useNavigate()
  const limit = 12

  const userRole: string | undefined =
    (user as any)?.user_metadata?.role ??
    (user as any)?.app_metadata?.role ??
    (user as any)?.role

  const { data: taxonomyData } = usePublicTaxonomy()
  const {
    data: allRequests,
    isLoading: isLoadingReqs,
  } = usePublicOpenRequests({
    categoryId: selectedCategory,
    brandIds: selectedBrands,
    search: searchQuery,
    limit,
    offset: page * limit,
  })

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSelectedBrands([])
    setUrgency('any')
    setSearchQuery('')
    setPage(0)
  }

  const sortedRequests = React.useMemo(() => {
    if (!allRequests) return []
    let result = [...allRequests]

    if (urgency !== 'any') {
      result = result.filter((r: any) => r.urgency === urgency)
    }

    if (sortOption === 'urgency') {
      const urgencyOrder: Record<string, number> = { asap: 0, standard: 1 }
      result.sort((a: any, b: any) => (urgencyOrder[a.urgency] ?? 99) - (urgencyOrder[b.urgency] ?? 99))
    } else {
      result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [allRequests, sortOption, urgency])

  const handleQuote = (req: any) => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    if (userRole !== 'seller') {
      toast.error(t('errors.unauthorized_seller', 'Only sellers can send quotes.'))
      return
    }
    if (req.buyerId === (user as any)?.id) return
    setSelectedRequest(req)
  }

  const totalCount = sortedRequests.length
  const isMorePages = totalCount >= limit

  return (
    <div className="flex flex-col flex-1 bg-background">
      <CategoryBar
        categories={taxonomyData?.categories || []}
        selectedCategory={selectedCategory}
        setSelectedCategory={(id) => { setSelectedCategory(id); setPage(0) }}
        brands={taxonomyData?.brands || []}
        selectedBrands={selectedBrands}
        setSelectedBrands={(brands) => { setSelectedBrands(brands); setPage(0) }}
        urgency={urgency}
        setUrgency={(u) => { setUrgency(u); setPage(0) }}
        onReset={handleResetFilters}
      />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                Demand <span className="text-primary">Feed</span>
              </h1>
              {!isLoadingReqs && (
                <span className="inline-flex items-center h-6 px-2 rounded-md bg-muted text-muted-foreground text-xs font-semibold tabular-nums">
                  {totalCount} {totalCount === 1 ? 'request' : 'requests'}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Browse live spare part requests from buyers across Algeria
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOption(sortOption === 'newest' ? 'urgency' : 'newest')}
              className="h-9 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Sort: {sortOption === 'newest' ? 'Newest' : 'Urgency'}
            </Button>
          </div>
        </div>

        {/* Auth-aware banner for unauthenticated users */}
        {!isAuthenticated && !isLoadingReqs && sortedRequests.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Are you a seller?</p>
                <p className="text-xs text-muted-foreground">Sign in to send quotes and grow your business.</p>
              </div>
            </div>
            <Link to="/login">
              <Button size="sm" className="h-9 px-5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:brightness-110">
                Sign In to Quote
                <ArrowRight className="ms-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Auth-aware banner for logged-in buyers */}
        {isAuthenticated && userRole !== 'seller' && !isLoadingReqs && sortedRequests.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Looking for a specific part?</p>
                <p className="text-xs text-muted-foreground">Post your own request and let sellers compete to give you the best quote.</p>
              </div>
            </div>
            <Link to="/dashboard/requests/new">
              <Button size="sm" className="h-9 px-5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:brightness-110">
                Post a Request
                <ArrowRight className="ms-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Feed */}
        <MarketplaceFeed
          requests={sortedRequests}
          isLoading={isLoadingReqs}
          userId={(user as any)?.id}
          userRole={userRole}
          onQuote={handleQuote}
          onClearFilters={handleResetFilters}
        />

        {/* Pagination */}
        {sortedRequests.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-border hover:border-primary/30 hover:text-primary transition-all"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums min-w-[4rem] text-center">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-border hover:border-primary/30 hover:text-primary transition-all"
              onClick={() => setPage((p) => p + 1)}
              disabled={!isMorePages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      <SendOfferDialog
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        user={user}
      />

      {/* Minimal footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-[1700px] mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold text-muted-foreground tracking-tight">
            MLILA Marketplace
          </span>
          <div className="flex items-center gap-6 text-[11px] font-semibold text-muted-foreground/60">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
