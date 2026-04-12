'use client'

import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Filter, Zap, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  onReset
}: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categories])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const activeFilters = (selectedCategory !== 'all' ? 1 : 0) + 
                       (selectedBrands.length > 0 ? 1 : 0) + 
                       (urgency !== 'any' ? 1 : 0)

  return (
    <div className="sticky top-20 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-6 lg:px-14 flex items-center h-20 gap-8">
        
        {/* Scrollable Categories Container */}
        <div className="relative flex-1 flex items-center overflow-hidden">
          {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-8 overflow-x-auto px-2 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-2 group transition-all",
                selectedCategory === 'all' 
                  ? "text-primary border-b-2 border-primary pb-2" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white border-b-2 border-transparent pb-2"
              )}
            >
              <Zap className={cn("w-5 h-5", selectedCategory === 'all' ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">All Items</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-2 group transition-all",
                  selectedCategory === cat.id 
                    ? "text-primary border-b-2 border-primary pb-3 mt-1" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white border-b-2 border-transparent pb-3 mt-1"
                )}
              >
                <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>

          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 flex items-center justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Filters & Utilities Section */}
        <div className="flex items-center gap-3 border-s border-slate-100 dark:border-slate-800 ps-8">
          <Button
            variant="outline"
            onClick={() => setIsBrandDialogOpen(true)}
            className={cn(
              "rounded-2xl h-11 px-6 border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest gap-2 relative",
              selectedBrands.length > 0 && "bg-primary/5 border-primary/20 text-primary"
            )}
          >
            <Filter className="w-4 h-4" />
            Brands
            {selectedBrands.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 min-w-[20px] p-0 flex items-center justify-center bg-primary text-white border-white border-2">
                {selectedBrands.length}
              </Badge>
            )}
          </Button>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 h-11">
            <button
              onClick={() => setUrgency('any')}
              className={cn(
                "px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                urgency === 'any' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400"
              )}
            >
              Any Time
            </button>
            <button
              onClick={() => setUrgency('asap')}
              className={cn(
                "px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                urgency === 'asap' ? "bg-white dark:bg-red-500 text-white shadow-sm" : "text-slate-400"
              )}
            >
              ASAP
            </button>
          </div>

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="w-11 h-11 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <BrandSelectionDialog
        isOpen={isBrandDialogOpen}
        onOpenChange={setIsBrandDialogOpen}
        brands={brands}
        selectedBrands={selectedBrands}
        onSelect={setSelectedBrands}
      />
    </div>
  )
}
