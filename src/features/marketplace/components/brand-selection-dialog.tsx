'use client'

import * as React from 'react'
import { Check, Search, Star, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Brand {
  id: string
  brand: string
}

interface BrandSelectionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  brands: Array<Brand>
  selectedBrands: Array<string>
  onSelect: (brandIds: Array<string>) => void
}

const POPULAR_BRAND_NAMES = ['Renault', 'Peugeot', 'Dacia', 'Volkswagen']

export function BrandSelectionDialog({
  isOpen,
  onOpenChange,
  brands = [],
  selectedBrands = [],
  onSelect,
}: BrandSelectionDialogProps) {
  const { t } = useTranslation(['marketplace', 'home/explore'])
  const [searchQuery, setSearchQuery] = React.useState('')

  // 1. Performance: Filter and flatten brands with useMemo
  const { popularBrands, filteredBrands, totalResults } = React.useMemo(() => {
    const filtered = brands
      .filter((b) => b.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.brand.localeCompare(b.brand))

    const popular = brands.filter((b) => 
      POPULAR_BRAND_NAMES.includes(b.brand) && 
      b.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return { 
      popularBrands: popular, 
      filteredBrands: filtered,
      totalResults: filtered.length
    }
  }, [brands, searchQuery])

  const toggleBrand = React.useCallback((id: string) => {
    const next = selectedBrands.includes(id)
      ? selectedBrands.filter((b) => b !== id)
      : [...selectedBrands, id]
    onSelect(next)
  }, [selectedBrands, onSelect])

  const getBrandLogo = (brandName: string) => {
    return `https://logo.clearbit.com/${brandName.toLowerCase().replace(/\s+/g, '')}.com?size=120`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] h-[85vh] sm:h-[80vh] p-0 border-none sm:rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950 overflow-hidden flex flex-col transition-all duration-300">
        {/* Sticky Header with Premium Search */}
        <div className="p-6 pb-2 space-y-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <DialogHeader className="p-0">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-2">
                <span className="text-primary italic">/</span> {t('filters.brands', 'Select Brand')}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
               {selectedBrands.length > 0 && (
                 <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">
                   {selectedBrands.length} Selected
                 </Badge>
               )}
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
                 onClick={() => onOpenChange(false)}
               >
                 <X className="size-5" />
               </Button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t('controls.search_placeholder', 'Search machine brands...')}
              className="w-full ps-11 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-2 focus-visible:ring-primary/20 h-12 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth premium-scrollbar">
          <div className="p-6 pt-2 space-y-10">
            {/* 1. Popular Section - Grid Layout */}
            {popularBrands.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  <Star className="size-3 fill-slate-400" /> Popular Brands
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {popularBrands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand.id)
                    return (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.id)}
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-300",
                          isSelected
                            ? "bg-primary/5 border-primary shadow-[0_8px_24px_-8px_rgba(var(--primary),0.3)] ring-1 ring-primary"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:translate-y-[-4px]"
                        )}
                      >
                        <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-4 p-3 flex items-center justify-center transition-transform group-hover:scale-110">
                          <img
                            src={getBrandLogo(brand.brand)}
                            alt={brand.brand}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.brand}&background=random`
                            }}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className={cn(
                          "text-xs font-black uppercase tracking-widest text-center",
                          isSelected ? "text-primary" : "text-slate-600 dark:text-slate-300"
                        )}>
                          {brand.brand}
                        </span>
                        {isSelected && (
                          <div className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Check className="size-3 text-white stroke-[4]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* 2. All Brands - Unified Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                All Brands
              </div>
              {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredBrands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand.id)
                    return (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border text-start transition-all group",
                          isSelected
                            ? "bg-primary/5 border-primary ring-1 ring-primary shadow-sm"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50"
                        )}
                      >
                        <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                          <img
                            src={getBrandLogo(brand.brand)}
                            alt={brand.brand}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.brand}&background=random`
                            }}
                            className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-bold flex-1 truncate",
                          isSelected ? "text-primary" : "text-slate-700 dark:text-slate-200"
                        )}>
                          {brand.brand}
                        </span>
                        {isSelected && (
                          <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="size-3 text-white stroke-[4]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 text-slate-300">
                    <Search className="size-8" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight italic">No Results found</h3>
                  <p className="text-sm text-slate-500 max-w-[200px] mt-1 italic">
                    We couldn't find any brands matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white"
            onClick={() => onSelect([])}
          >
            Reset Selection
          </Button>
          <Button 
            className="h-12 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            onClick={() => onOpenChange(false)}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
