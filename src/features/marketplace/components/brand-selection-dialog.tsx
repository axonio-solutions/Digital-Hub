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
  imageUrl?: string | null
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

  const { popularBrands, filteredBrands } = React.useMemo(() => {
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
    }
  }, [brands, searchQuery])

  const toggleBrand = React.useCallback(
    (id: string) => {
      const next = selectedBrands.includes(id)
        ? selectedBrands.filter((b) => b !== id)
        : [...selectedBrands, id]
      onSelect(next)
    },
    [selectedBrands, onSelect]
  )

  const getBrandLogo = (brand: Brand) => {
    return brand.imageUrl || `https://ui-avatars.com/api/?name=${brand.brand}&background=random&size=64`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] h-[80vh] p-0 border-border rounded-2xl shadow-2xl bg-card overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 space-y-4 bg-card/80 backdrop-blur-xl z-20 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
                {t('filters.brands', 'Select Brand')}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              {selectedBrands.length > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px] px-2.5 py-1 uppercase tracking-wider">
                  {selectedBrands.length} Selected
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-muted"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t('controls.search_placeholder', 'Search brands...')}
              className="w-full ps-10 rounded-xl bg-muted border-border focus-visible:ring-1 focus-visible:ring-primary/30 h-11 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-5 space-y-8">
            {/* Popular Brands */}
            {popularBrands.length > 0 && searchQuery.length === 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Star className="size-3 fill-amber-400 text-amber-400" /> Popular Brands
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {popularBrands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand.id)
                    return (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.id)}
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200",
                          isSelected
                            ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                        )}
                      >
                        <div className="size-12 rounded-lg bg-muted mb-3 p-2 flex items-center justify-center">
                          <img
                            src={getBrandLogo(brand)}
                            alt={brand.brand}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.brand}&background=random`
                            }}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className={cn(
                          "text-[11px] font-bold uppercase tracking-wide text-center",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {brand.brand}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                            <Check className="size-3 text-primary-foreground stroke-[3]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* All Brands */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                All Brands
              </div>
              {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredBrands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand.id)
                    return (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-start transition-all duration-200",
                          isSelected
                            ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-primary/30 hover:bg-muted/50"
                        )}
                      >
                        <div className="size-9 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center p-1.5">
                          <img
                            src={getBrandLogo(brand)}
                            alt={brand.brand}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-semibold flex-1 truncate",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {brand.brand}
                        </span>
                        {isSelected && (
                          <div className="size-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="size-3 text-primary-foreground stroke-[3]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    <Search className="size-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">No results found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No brands matching &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/50 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            onClick={() => onSelect([])}
          >
            Reset
          </Button>
          <Button
            className="h-10 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all"
            onClick={() => onOpenChange(false)}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
