'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Filter, Zap, LayoutGrid, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BrandSelectionDialog } from "../brand-selection-dialog"
import { useState } from "react"

interface MarketplaceSidebarProps {
  categories: any[]
  brands: any[]
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  urgency: string
  setUrgency: (urgency: string) => void
  onReset: () => void
}

export function MarketplaceSidebar({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrands,
  setSelectedBrands,
  urgency,
  setUrgency,
  onReset
}: MarketplaceSidebarProps) {
  const { t } = useTranslation(['home/explore', 'marketplace'])
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false)

  const hasFilters = selectedCategory !== 'all' || selectedBrands.length > 0 || urgency !== 'any'

  return (
    <aside className="w-full flex flex-col gap-8 pb-10">
      {/* Categories Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <LayoutGrid className="w-4 h-4 text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categories</h3>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group shadow-sm",
              selectedCategory === "all"
                ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]"
                : "bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md"
            )}
          >
            <span className="tracking-wide">{t('filters.all_categories')}</span>
            {selectedCategory === "all" && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
          </button>
          
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group shadow-sm",
                selectedCategory === cat.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 scale-[1.02]"
                  : "bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md"
              )}
            >
              <span className="truncate pr-2 tracking-wide">{cat.name}</span>
              {selectedCategory === cat.id && <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900 shadow-sm" />}
            </button>
          ))}
        </div>
      </section>

      <Separator className="bg-slate-100 dark:bg-slate-800/50" />

      {/* Brand Selector */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Manufacturer</h3>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsBrandDialogOpen(true)}
          className={cn(
            "w-full h-14 justify-between px-5 rounded-2xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all duration-300",
            selectedBrands.length > 0 && "bg-slate-900 dark:bg-white border-transparent text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm font-bold tracking-wide">
              {selectedBrands.length === 0 ? 'All Brands' : `${selectedBrands.length} Selected`}
            </span>
          </div>
          {selectedBrands.length > 0 && (
            <Badge className="bg-primary text-white border-none h-6 min-w-[24px] flex items-center justify-center p-0 text-[10px] font-black rounded-full shadow-sm">
              {selectedBrands.length}
            </Badge>
          )}
        </Button>

        <BrandSelectionDialog
          isOpen={isBrandDialogOpen}
          onOpenChange={setIsBrandDialogOpen}
          brands={brands || []}
          selectedBrands={selectedBrands}
          onSelect={setSelectedBrands}
        />
      </section>

      <Separator className="bg-slate-100 dark:bg-slate-800/50" />

      {/* Urgency Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timeframe</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setUrgency("any")}
            className={cn(
              "flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 shadow-sm relative overflow-hidden",
              urgency === "any"
                ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 transform scale-[1.02] shadow-xl shadow-slate-900/20 dark:shadow-white/10"
                : "bg-white/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <div className={cn("w-2.5 h-2.5 rounded-full z-10 transition-colors", urgency === "any" ? "bg-primary" : "bg-slate-300 dark:bg-slate-600")} />
            <span className="z-10 tracking-wide">Standard</span>
            {urgency === "any" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" />
            )}
          </button>
          
          <button
            onClick={() => setUrgency("asap")}
            className={cn(
              "flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 shadow-sm relative overflow-hidden",
              urgency === "asap"
                ? "bg-red-500 border-red-500 text-white transform scale-[1.02] shadow-xl shadow-red-500/30"
                : "bg-white/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-red-200 dark:hover:border-red-900/50"
            )}
          >
            <div className={cn("w-2.5 h-2.5 rounded-full z-10 transition-colors", urgency === "asap" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-slate-300 dark:bg-slate-600")} />
            <span className="z-10 tracking-wide">Immediate (ASAP)</span>
            {urgency === "asap" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
            )}
          </button>
        </div>
      </section>

      {/* Reset Actions */}
      {hasFilters && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="mt-4 w-full h-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <X className="w-3 h-3 me-2" />
          Reset Filters
        </Button>
      )}
    </aside>
  )
}
