'use client'

import { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, SlidersHorizontal, Zap, X, Clock } from 'lucide-react'
import { BrandSelectionDialog } from '../brand-selection-dialog'

interface CategoryBarProps {
  categories: any[]
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  brands: any[]
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  urgency: string
  setUrgency: (u: string) => void
  onReset: () => void
}

export function CategoryBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  brands,
  selectedBrands,
  setSelectedBrands,
  urgency,
  setUrgency,
  onReset,
}: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false)

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
    (selectedBrands.length > 0 ? 1 : 0) +
    (urgency !== 'any' ? 1 : 0)

  const allCategories = [
    { id: 'all', name: 'All Parts' },
    ...categories.map((c: any) => ({ id: c.id, name: c.name })),
  ]

  return (
    <>
      <div className="sticky top-14 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        {/* Active filter indicator */}
        {activeFilterCount > 0 && (
          <div className="h-0.5 bg-primary transition-all duration-500" style={{ width: `${Math.min(activeFilterCount * 33.3, 100)}%` }} />
        )}

        <div className="max-w-[1700px] mx-auto px-4 lg:px-8">
          <div className="flex items-center h-13 gap-0">
            {/* Scrollable category pills */}
            <div className="relative flex-1 flex items-center min-w-0">
              {/* Left fade */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center pointer-events-none transition-opacity duration-200",
                showLeft ? "opacity-100" : "opacity-0"
              )}>
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
                <button
                  onClick={() => nudge('left')}
                  aria-label="Scroll categories left"
                  className={cn(
                    "pointer-events-auto relative z-10 w-7 h-7 rounded-lg flex items-center justify-center",
                    "bg-card border border-border shadow-sm hover:border-primary/30 hover:text-primary transition-all duration-200",
                    "text-muted-foreground"
                  )}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pills */}
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
                        "flex-shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent hover:border-border"
                      )}
                    >
                      {cat.id === 'all' && <Zap className="w-3 h-3" />}
                      {cat.name}
                    </button>
                  )
                })}
              </div>

              {/* Right fade */}
              <div className={cn(
                "absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end pointer-events-none transition-opacity duration-200",
                showRight ? "opacity-100" : "opacity-0"
              )}>
                <div className="absolute inset-0 bg-gradient-to-l from-background via-background/90 to-transparent" />
                <button
                  onClick={() => nudge('right')}
                  aria-label="Scroll categories right"
                  className={cn(
                    "pointer-events-auto relative z-10 w-7 h-7 rounded-lg flex items-center justify-center",
                    "bg-card border border-border shadow-sm hover:border-primary/30 hover:text-primary transition-all duration-200",
                    "text-muted-foreground"
                  )}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-border mx-3 flex-shrink-0" />

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-shrink-0 pr-1">
              {/* Brands */}
              <button
                onClick={() => setIsBrandDialogOpen(true)}
                className={cn(
                  "relative flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  selectedBrands.length > 0
                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent hover:border-border"
                )}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Brands
                {selectedBrands.length > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-primary text-primary-foreground text-[9px] font-bold leading-none">
                    {selectedBrands.length}
                  </span>
                )}
              </button>

              {/* Urgency toggle */}
              <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border h-8">
                <button
                  onClick={() => setUrgency('any')}
                  className={cn(
                    "flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                    urgency === 'any'
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Clock className="w-3 h-3" />
                  Any
                </button>
                <button
                  onClick={() => setUrgency('asap')}
                  className={cn(
                    "flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                    urgency === 'asap'
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Zap className="w-3 h-3" />
                  ASAP
                </button>
              </div>

              {/* Clear filters */}
              <button
                onClick={onReset}
                aria-label="Clear all filters"
                className={cn(
                  "flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold border transition-all duration-300 overflow-hidden whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40",
                  activeFilterCount > 0
                    ? "opacity-100 max-w-[120px] bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10"
                    : "opacity-0 max-w-0 border-transparent pointer-events-none"
                )}
              >
                <X className="w-3 h-3 flex-shrink-0" />
                Clear{activeFilterCount > 1 && ` (${activeFilterCount})`}
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
