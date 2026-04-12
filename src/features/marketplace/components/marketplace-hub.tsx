import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  FilterX,
  LayoutGrid,
  Search as SearchIcon,
  Table as TableIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

// Components
import { RequestCard } from './request-card'
import { MarketplaceDataTable } from './marketplace-data-table'
import { SubmitQuoteForm } from './submit-quote-form'
import { RequestDetailsCompact } from './request-details-compact'
import { SendOfferDialog } from './send-offer-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog'

// Hooks
import { useAuth } from '@/features/auth/hooks/use-auth'
import { requestKeys, useOpenRequests, usePublicTaxonomy } from '@/features/requests/hooks/use-requests'
import { supabase } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'
import { tCategory } from '@/utils/category-utils'

export function MarketplaceHub() {
  const { t, i18n } = useTranslation('marketplace')
  const { data: user } = useAuth()
  const queryClient = useQueryClient()
  const search = useSearch({ from: '/_authed/dashboard/marketplace/' })
  const navigate = useNavigate({ from: '/_authed/dashboard/marketplace/' })
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [newRequestsCount, setNewRequestsCount] = useState(0)

  // Fetch Data
  const { data: taxonomy } = usePublicTaxonomy()
  const { data: requests = [], isLoading, isError } = useOpenRequests({
    categoryId: search.category,
    brandIds: search.brands,
    search: search.search
  })

  // Real-time listener
  useEffect(() => {
    const channel = supabase.channel('public-marketplace-ui')
      .on('broadcast', { event: 'NEW_REQUEST' }, (payload) => {
        setNewRequestsCount(prev => prev + 1)
        toast.info('New Request Available!', {
          description: 'A new opportunity has been posted in the marketplace.',
          action: {
            label: 'Show Now',
            onClick: () => {
              queryClient.invalidateQueries({ queryKey: requestKeys.open() })
              setNewRequestsCount(0)
            }
          }
        })
      })
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  // Handlers
  const handleSearchChange = (val: string) => {
    navigate({ search: (prev) => ({ ...prev, search: val || undefined, page: 1 }) })
  }

  const handleCategoryChange = (val: string) => {
    navigate({ search: (prev) => ({ ...prev, category: val === 'all' ? undefined : val, page: 1 }) })
  }

  const handleBrandToggle = (brandId: string) => {
    const currentBrands = search.brands || []
    const nextBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(b => b !== brandId)
      : [...currentBrands, brandId]
    
    navigate({ search: (prev) => ({ ...prev, brands: nextBrands.length > 0 ? nextBrands : undefined, page: 1 }) })
  }

  const clearFilters = () => {
    navigate({ search: {} })
  }

  if (isError) return <div className="p-8 text-center text-red-500">Failed to load marketplace.</div>

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-sm font-medium text-slate-500 italic">
            {t('description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {newRequestsCount > 0 && (
            <Button 
              variant="default" 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600 font-bold animate-bounce"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: requestKeys.open() })
                setNewRequestsCount(0)
              }}
            >
              <Bell className="size-4 me-2" />
              {newRequestsCount} New
            </Button>
          )}

          <div className="flex bg-white dark:bg-slate-900 border border-border rounded-xl p-1 shadow-sm">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("size-8 rounded-lg transition-all", viewMode === 'grid' && "bg-slate-100 dark:bg-slate-800 text-primary")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("size-8 rounded-lg transition-all", viewMode === 'table' && "bg-slate-100 dark:bg-slate-800 text-primary")}
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "hidden lg:flex flex-col w-80 bg-white dark:bg-slate-900 border-e border-border p-6 gap-8",
          i18n.language === 'ar' ? "order-last" : "order-first"
        )}>
          {/* Search */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Search Parts</Label>
            <div className="relative">
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="Name or OEM..." 
                className="ps-10 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800"
                value={search.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          <Separator className="bg-slate-100 dark:bg-slate-800" />

          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categories</Label>
              {search.category && (
                <Button variant="ghost" className="h-4 p-0 text-[10px] font-bold text-primary hover:bg-transparent" onClick={() => handleCategoryChange('all')}>Clear</Button>
              )}
            </div>
            <RadioGroup value={search.category || 'all'} onValueChange={handleCategoryChange} className="gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="cat-all" />
                <Label htmlFor="cat-all" className="text-sm font-bold cursor-pointer">All Categories</Label>
              </div>
              {taxonomy?.categories.map((cat: any) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={cat.id} id={`cat-${cat.id}`} />
                  <Label htmlFor={`cat-${cat.id}`} className="text-sm font-bold cursor-pointer">
                    {tCategory(cat.name, t)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator className="bg-slate-100 dark:bg-slate-800" />

          {/* Brands */}
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Brands</Label>
              {search.brands && search.brands.length > 0 && (
                <Button variant="ghost" className="h-4 p-0 text-[10px] font-bold text-primary hover:bg-transparent" onClick={() => navigate({ search: (p) => ({ ...p, brands: undefined }) })}>Clear</Button>
              )}
            </div>
            <ScrollArea className="flex-1 -me-4 pe-4">
              <div className="space-y-4">
                {taxonomy?.brands.map((brand: any) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`brand-${brand.id}`} 
                      checked={search.brands?.includes(brand.id)}
                      onCheckedChange={() => handleBrandToggle(brand.id)}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="text-sm font-bold cursor-pointer">
                      {brand.brand}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Clear All */}
          {(search.category || search.brands || search.search) && (
            <Button variant="outline" className="w-full rounded-2xl border-dashed" onClick={clearFilters}>
              <FilterX className="size-4 me-2" />
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Content */}
        <main className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="p-6">
              {isLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
                    <Filter className="size-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">No Results Found</h3>
                  <p className="text-slate-500 max-w-sm mb-8">Try adjusting your filters or search terms to find what you are looking for.</p>
                  <Button variant="outline" className="rounded-2xl" onClick={clearFilters}>Clear All Filters</Button>
                </div>
              ) : (
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                    : "space-y-4"
                )}>
                  {viewMode === 'grid' ? (
                    requests.map((req: any) => (
                      <RequestCard 
                        key={req.id} 
                        request={req} 
                        onQuote={setSelectedRequest} 
                        isOwner={req.buyerId === user?.id}
                      />
                    ))
                  ) : (
                    <MarketplaceDataTable 
                      data={requests} 
                      type="opportunity"
                      onAction={(action) => {
                        if (action.type === 'send_offer') setSelectedRequest(action.item)
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Quote Dialog */}
      <SendOfferDialog 
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        user={user}
      />
    </div>
  )
}
