'use client'

import React, { useState } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { CategoryBar } from './explore/category-bar'
import { MarketplaceFeed } from './explore/marketplace-feed'
import { useToast } from '@/hooks/use-toast'
import {
  usePublicOpenRequests,
  usePublicTaxonomy,
} from '@/features/requests/hooks/use-requests'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AUTH_ROUTES, BUYER_ROUTES, PUBLIC_ROUTES, SELLER_ROUTES } from '@/lib/routes'

const routeApi = getRouteApi('/_public/requests/')

export function PublicMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrands, setSelectedBrands] = useState<Array<string>>([])
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')

  const { t, i18n } = useTranslation(['home/explore', 'marketplace'])
  const { toast } = useToast('home/explore')
  const isRtl = i18n.dir() === 'rtl'

  const { q: urlSearchQuery = '' } = routeApi.useSearch()
  const searchQuery = urlSearchQuery || searchInput

  const { data: user } = useAuth()
  const isAuthenticated = !!user
  const navigate = useNavigate()
  const limit = 12

  const userRole: string | undefined =
    (user as any)?.user_metadata?.role ??
    (user as any)?.app_metadata?.role ??
    (user as any)?.role

  const { data: taxonomyData } = usePublicTaxonomy()
  const { data: allRequests, isLoading: isLoadingReqs } = usePublicOpenRequests(
    {
      categoryId: selectedCategory,
      brandIds: selectedBrands,
      search: searchQuery,
      limit,
      offset: page * limit,
    },
  )

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSelectedBrands([])
    setPage(0)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({ to: PUBLIC_ROUTES.EXPLORE, search: { q: searchInput } as any })
  }

  const sortedRequests = React.useMemo(() => {
    if (!allRequests) return []
    const result = [...allRequests]
    result.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return result
  }, [allRequests])

  const handleQuote = (req: any) => {
    if (!isAuthenticated) {
      navigate({ to: AUTH_ROUTES.LOGIN })
      return
    }
    if (userRole !== 'seller') {
      toast.error('errors.unauthorized_seller')
      return
    }
    if (req.buyerId === (user as any)?.id) return
    navigate({
      to: SELLER_ROUTES.MARKETPLACE_REQUEST_PATTERN,
      params: { requestId: req.id },
    } as any)
  }

  const totalCount = sortedRequests.length
  const isMorePages = totalCount >= limit

  return (
    <div className="flex flex-col flex-1 bg-background">
      {/* Cohesive header: search → categories → title */}
      <div className="border-b border-border bg-background">
        {/* Search */}
        <div className="max-w-[1700px] mx-auto px-4 lg:px-8 pt-3 pb-1.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 pl-10 pr-4 rounded-xl border-border bg-muted/40 text-sm placeholder:text-muted-foreground/40"
            />
          </form>
        </div>

        {/* Categories */}
        <CategoryBar
          categories={taxonomyData?.categories || []}
          selectedCategory={selectedCategory}
          setSelectedCategory={(id) => {
            setSelectedCategory(id)
            setPage(0)
          }}
          brands={taxonomyData?.brands || []}
          selectedBrands={selectedBrands}
          setSelectedBrands={(brands) => {
            setSelectedBrands(brands)
            setPage(0)
          }}
          onReset={handleResetFilters}
        />

        {/* Title + count */}
        <div className="max-w-[1700px] mx-auto px-4 lg:px-8 pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold tracking-tight text-foreground">
              {t('header.title')}{' '}
              <span className="text-primary">
                {t('header.title_highlight')}
              </span>
            </h1>
            {!isLoadingReqs && (
              <span className="text-xs font-semibold text-muted-foreground/55 tabular-nums">
                {totalCount}{' '}
                {totalCount === 1
                  ? t('header.requests')
                  : t('header.requests_plural')}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 lg:px-8 py-6">
        {/* Auth banner — unauthenticated */}
        {!isAuthenticated && !isLoadingReqs && sortedRequests.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t('banners.unauthenticated.title')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('banners.unauthenticated.desc')}
                </p>
              </div>
            </div>
            <Link to="/login">
              <Button
                size="sm"
                className="h-9 px-5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:brightness-110"
              >
                {t('banners.unauthenticated.cta')}
                <ArrowRight className="ms-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Auth banner — logged-in buyers */}
        {isAuthenticated &&
          userRole !== 'seller' &&
          !isLoadingReqs &&
          sortedRequests.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t('banners.buyer.title')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('banners.buyer.desc')}
                  </p>
                </div>
              </div>
              <Link to={BUYER_ROUTES.REQUESTS}>
                <Button
                  size="sm"
                  className="h-9 px-5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:brightness-110"
                >
                  {t('banners.buyer.cta')}
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
              {isRtl ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums min-w-[4rem] text-center">
              {t('pagination.page', { number: page + 1 })}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-border hover:border-primary/30 hover:text-primary transition-all"
              onClick={() => setPage((p) => p + 1)}
              disabled={!isMorePages}
            >
              {isRtl ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-[1700px] mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold text-muted-foreground tracking-tight">
            {t('footer.brand')}
          </span>
          <div className="flex items-center gap-6 text-[11px] font-semibold text-muted-foreground/60">
            <a href="#" className="hover:text-foreground transition-colors">
              {t('footer.terms')}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t('footer.privacy')}
            </a>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
