'use client'

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, SlidersHorizontal, Zap, X, Clock } from "lucide-react"
import { BrandSelectionDialog } from "../brand-selection-dialog"

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

  const allCategories = [{ id: 'all', name: 'All', icon: <Zap className="w-3.5 h-3.5" /> }, ...categories]

  return (
    <>
      {/* ── Bar Shell ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">

        {/* ── Active filter indicator strip ────────────────────────────────────── */}
        {activeFilterCount > 0 && (
          <div
            className="h-[2px] bg-primary transition-all duration-500"
            style={{ width: `${Math.min(activeFilterCount * 33.3, 100)}%` }}
          />
        )}

        <div className="max-w-[1700px] mx-auto px-6 lg:px-14">
          <div className="flex items-center h-[60px] gap-0">

            {/* ── Scrollable Category Pills ──────────────────────────────────────── */}
            <div className="relative flex-1 flex items-center min-w-0">

              {/* Left fade + arrow */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-14 z-10 flex items-center pointer-events-none transition-opacity duration-200",
                  showLeft ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent" />
                <button
                  onClick={() => nudge('left')}
                  aria-label="Scroll categories left"
                  className={cn(
                    "pointer-events-auto relative z-10 w-7 h-7 rounded-full flex items-center justify-center",
                    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700",
                    "shadow-sm hover:border-primary/40 hover:text-primary hover:shadow-md",
                    "text-slate-400 transition-all duration-200",
                    !showLeft && "pointer-events-none"
                  )}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pills list */}
              <div
                ref={scrollRef}
                className="flex items-center gap-1.5 overflow-x-auto w-full py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {allCategories.map((cat) => {
                  const isActive = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      id={`cat-pill-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15)] shadow-primary/25 scale-[1.03]"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      {cat.icon && (
                        <span className={cn("transition-colors", isActive ? "text-primary-foreground" : "text-slate-400")}>
                          {cat.icon}
                        </span>
                      )}
                      {cat.name}
                    </button>
                  )
                })}
              </div>

              {/* Right fade + arrow */}
              <div
                className={cn(
                  "absolute right-0 top-0 bottom-0 w-14 z-10 flex items-center justify-end pointer-events-none transition-opacity duration-200",
                  showRight ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent" />
                <button
                  onClick={() => nudge('right')}
                  aria-label="Scroll categories right"
                  className={cn(
                    "pointer-events-auto relative z-10 w-7 h-7 rounded-full flex items-center justify-center",
                    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700",
                    "shadow-sm hover:border-primary/40 hover:text-primary hover:shadow-md",
                    "text-slate-400 transition-all duration-200",
                    !showRight && "pointer-events-none"
                  )}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Divider ───────────────────────────────────────────────────────── */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-5 flex-shrink-0" />

            {/* ── Filter Controls ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Brands filter button */}
              <button
                id="brand-filter-btn"
                onClick={() => setIsBrandDialogOpen(true)}
                className={cn(
                  "relative flex items-center gap-2 h-8 px-3.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  selectedBrands.length > 0
                    ? "bg-primary/10 dark:bg-primary/20 text-primary border border-primary/25 hover:bg-primary/15"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Brands</span>
                {selectedBrands.length > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black leading-none">
                    {selectedBrands.length}
                  </span>
                )}
              </button>

              {/* Urgency toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 border border-slate-200 dark:border-slate-800 h-8 gap-0.5">
                <button
                  id="urgency-any-btn"
                  onClick={() => setUrgency('any')}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 whitespace-nowrap",
                    urgency === 'any'
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <Clock className="w-3 h-3" />
                  Any
                </button>
                <button
                  id="urgency-asap-btn"
                  onClick={() => setUrgency('asap')}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 whitespace-nowrap",
                    urgency === 'asap'
                      ? "bg-red-500 text-white shadow-sm shadow-red-500/30"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <Zap className="w-3 h-3" />
                  ASAP
                </button>
              </div>

              {/* Clear all — animates in when any filter is active */}
              <button
                id="clear-filters-btn"
                onClick={onReset}
                aria-label="Clear all filters"
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-bold border transition-all duration-300 overflow-hidden whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
                  activeFilterCount > 0
                    ? "opacity-100 max-w-[120px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/60"
                    : "opacity-0 max-w-0 border-transparent pointer-events-none"
                )}
              >
                <X className="w-3 h-3 flex-shrink-0" />
                <span>
                  Clear
                  {activeFilterCount > 1 && (
                    <span className="ms-1 opacity-70">({activeFilterCount})</span>
                  )}
                </span>
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
