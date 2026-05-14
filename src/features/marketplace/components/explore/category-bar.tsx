'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Search, X, Zap } from 'lucide-react'
import { CategoryDisplay } from '@/components/ui/category-display'
import { BrandSelectionDialog } from '../brand-selection-dialog'
import { useTranslation } from 'react-i18next'
import { tCategory } from '@/utils/category-utils'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface CategoryBarProps {
  categories: Array<any>
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  brands: Array<any>
  selectedBrands: Array<string>
  setSelectedBrands: (brands: Array<string>) => void
  onReset: () => void
}

export function CategoryBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  brands,
  selectedBrands,
  setSelectedBrands,
  onReset,
}: CategoryBarProps) {
  const { t } = useTranslation('marketplace')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState('')

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 2)
    setShowRight(scrollLeft < scrollWidth - clientWidth - 2)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [categories])

  const nudge = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' })
  }

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrands.length > 0 ? 1 : 0)

  const allCategories = [
    { id: 'all', name: 'All Parts' },
    ...categories.map((c: any) => ({ ...c, id: c.id, name: c.name })),
  ]

  const selectedCategoryName = allCategories.find((c) => c.id === selectedCategory)?.name || ''
  const selectedBrandNames = brands.filter((b: any) => selectedBrands.includes(b.id)).map((b: any) => b.brand || b.name)

  const displayCategoryName = selectedCategory !== 'all' ? tCategory(selectedCategoryName, t) : ''
  const filterLabel = [
    selectedCategory !== 'all' ? displayCategoryName : '',
    ...selectedBrandNames.slice(0, 2),
  ].filter(Boolean).join(' · ') || 'All Parts'

  const moreCount = selectedBrandNames.length > 2 ? selectedBrandNames.length - 2 : 0

  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(mobileSearch.toLowerCase()),
  )

  const filteredBrands = brands.filter((b: any) =>
    (b?.brand || b?.name)?.toLowerCase?.().includes(mobileSearch.toLowerCase()),
  )

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(
      selectedBrands.includes(brandId)
        ? selectedBrands.filter((id) => id !== brandId)
        : [...selectedBrands, brandId],
    )
  }

  return (
    <>
      <div className="sticky top-14 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        {activeFilterCount > 0 && (
          <div
            className="h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${Math.min(activeFilterCount * 50, 100)}%` }}
          />
        )}

        <div className="max-w-[1700px] mx-auto px-4 lg:px-8">
          {/* Mobile: full-width filter button */}
          <div className="flex md:hidden items-center h-12">
            <Popover open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-semibold transition-all w-full',
                    activeFilterCount > 0
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted text-muted-foreground border border-transparent',
                  )}
                >
                  <span className="truncate">{filterLabel}</span>
                  {moreCount > 0 && (
                    <span className="text-[9px] opacity-60 shrink-0">+{moreCount}</span>
                  )}
                  {activeFilterCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none shrink-0 px-1">
                      {activeFilterCount + (selectedBrands.length > 1 ? selectedBrands.length - 1 : 0)}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="bottom"
                sideOffset={4}
                className="w-[calc(100vw-2rem)] max-w-[380px] p-0 rounded-2xl border-border shadow-xl"
              >
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      placeholder="Search categories & brands..."
                      value={mobileSearch}
                      onChange={(e) => setMobileSearch(e.target.value)}
                      className="h-9 pl-9 pr-3 rounded-lg border-0 bg-muted/50 text-sm"
                    />
                  </div>
                </div>

                <div className="max-h-[30vh] overflow-y-auto p-1.5">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setMobileSearch('')
                      }}
                      className={cn(
                        'flex items-center w-full gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                        selectedCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground',
                      )}
                    >
                      <CategoryDisplay category={cat} showName={false} iconClassName="size-3.5" />
                      <span className="truncate">{cat.id === 'all' ? cat.name : tCategory(cat.name, t)}</span>

                      {selectedCategory === cat.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                    </button>
                  ))}
                  {filteredCategories.length === 0 && filteredBrands.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No results</p>
                  )}
                </div>

                {/* Brands section */}
                {brands.length > 0 && (
                  <>
                    <div className="border-t border-border px-3 pt-2 pb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Brands</p>
                    </div>
                    <div className="max-h-[30vh] overflow-y-auto p-1.5">
                      {filteredBrands.map((brand: any) => {
                        const isSelected = selectedBrands.includes(brand.id)
                        return (
                          <button
                            key={brand.id}
                            onClick={() => toggleBrand(brand.id)}
                            className={cn(
                              'flex items-center w-full gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                              isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground',
                            )}
                          >
                            <span className="truncate">{brand.brand || brand.name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />}
                          </button>
                        )
                      })}
                      {filteredBrands.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No brands match</p>
                      )}
                    </div>
                  </>
                )}

                {/* Footer: clear */}
                <div className="border-t border-border p-2 flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { onReset(); setMobileFilterOpen(false) }}
                      className="flex items-center gap-1 h-8 px-3 rounded-lg text-[10px] font-bold uppercase bg-destructive/10 text-destructive w-full justify-center"
                    >
                      Clear all filters{activeFilterCount > 1 ? ` (${activeFilterCount})` : ''}
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Desktop: horizontal scroll */}
          <div className="hidden md:flex items-center h-13 gap-0">
            <div className="relative flex-1 flex items-center min-w-0">
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center pointer-events-none transition-opacity duration-200',
                  showLeft ? 'opacity-100' : 'opacity-0',
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
                <button
                  onClick={() => nudge('left')}
                  aria-label="Scroll categories left"
                  className={cn(
                    'pointer-events-auto relative z-10 w-7 h-7 rounded-lg flex items-center justify-center',
                    'bg-card border border-border shadow-sm hover:border-primary/30 hover:text-primary transition-all duration-200',
                    'text-muted-foreground',
                  )}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex items-center gap-1.5 overflow-x-auto w-full py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {allCategories.map((cat) => {
                  const isActive = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent hover:border-border',
                      )}
                    >
                      {cat.id === 'all' ? (
                        <Zap className="w-3 h-3" />
                      ) : (
                        <CategoryDisplay category={cat} showName={false} iconClassName="size-3" />
                      )}
                      {cat.id === 'all' ? cat.name : tCategory(cat.name, t)}
                    </button>
                  )
                })}
              </div>

              <div
                className={cn(
                  'absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end pointer-events-none transition-opacity duration-200',
                  showRight ? 'opacity-100' : 'opacity-0',
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-background via-background/90 to-transparent" />
                <button
                  onClick={() => nudge('right')}
                  aria-label="Scroll categories right"
                  className={cn(
                    'pointer-events-auto relative z-10 w-7 h-7 rounded-lg flex items-center justify-center',
                    'bg-card border border-border shadow-sm hover:border-primary/30 hover:text-primary transition-all duration-200',
                    'text-muted-foreground',
                  )}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="w-px h-5 bg-border mx-3 flex-shrink-0" />

            <div className="flex items-center gap-2 flex-shrink-0 pr-1">
              <button
                onClick={() => setIsBrandDialogOpen(true)}
                className={cn(
                  'relative flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  selectedBrands.length > 0
                    ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent hover:border-border',
                )}
              >
                Brands
                {selectedBrands.length > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-primary text-primary-foreground text-[9px] font-bold leading-none">
                    {selectedBrands.length}
                  </span>
                )}
              </button>

              <button
                onClick={onReset}
                aria-label="Clear all filters"
                className={cn(
                  'flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold border transition-all duration-300 overflow-hidden whitespace-nowrap',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40',
                  activeFilterCount > 0
                    ? 'opacity-100 max-w-[120px] bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10'
                    : 'opacity-0 max-w-0 border-transparent pointer-events-none',
                )}
              >
                <X className="w-3 h-3 flex-shrink-0" />
                Clear{activeFilterCount > 1 ? ` (${activeFilterCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BrandSelectionDialog
        isOpen={isBrandDialogOpen}
        onOpenChange={setIsBrandDialogOpen}
        brands={brands}
        selectedBrands={selectedBrands}
        onSelect={setSelectedBrands}
      />
    </>
  )
}
