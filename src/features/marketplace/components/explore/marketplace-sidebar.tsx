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
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-bold transition-all group",
              selectedCategory === "all"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <span>{t('filters.all_categories')}</span>
            {selectedCategory === "all" && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
          </button>
          
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-bold transition-all group",
                selectedCategory === cat.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <span className="truncate pr-2">{cat.name}</span>
              {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
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
          className="w-full h-12 justify-between px-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm font-bold">
              {selectedBrands.length === 0 ? 'All Brands' : `${selectedBrands.length} Selected`}
            </span>
          </div>
          {selectedBrands.length > 0 && (
            <Badge className="bg-primary text-white border-none h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-black">
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
        
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setUrgency("any")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2",
              urgency === "any"
                ? "bg-slate-50 dark:bg-slate-800/50 border-primary text-primary"
                : "bg-white dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", urgency === "any" ? "bg-primary" : "bg-slate-300")} />
            Standard
          </button>
          <button
            onClick={() => setUrgency("asap")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2",
              urgency === "asap"
                ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600"
                : "bg-white dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", urgency === "asap" ? "bg-red-500" : "bg-slate-300")} />
            Immediate (ASAP)
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
