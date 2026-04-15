'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useTaxonomy } from '@/features/taxonomy/hooks/use-taxonomy'
import type { ProductFormData } from '@/types/product-schemas'
import { ChoiceGroup } from '@/components/ui/onboarding'
import {
  Car,
  Settings,
  Zap,
  ShieldCheck,
  Search,
  Wrench,
  Disc,
  Filter,
  LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// Icon mapping based on category names or ID patterns
const CATEGORY_ICONS: Record<string, any> = {
  'mechanical': Settings,
  'electrical': Zap,
  'bodywork': ShieldCheck,
  'interior': Car,
  'engines': Wrench,
  'wheels': Disc,
  'accessories': Search,
  'other': Filter,
}

export function CategoryStep() {
  const { t } = useTranslation('requests/form')
  const { data: taxonomy, isLoading } = useTaxonomy()
  const { setValue, watch } = useFormContext<ProductFormData>()

  const selectedCategoryId = watch('categoryId')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Header Section */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
        <div className="size-9 rounded-lg bg-background border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
          <LayoutGrid className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">
            {t('steps.category.title')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('steps.category.description')}
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}>
        <ChoiceGroup
          value={selectedCategoryId}
          onValueChange={(v) => setValue('categoryId', v)}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {taxonomy?.categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] || CATEGORY_ICONS['other']
            const isSelected = selectedCategoryId === category.id

            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <ChoiceGroup.Item
                  value={category.id}
                  className={cn(
                    "group relative flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 select-none cursor-pointer overflow-hidden",
                    isSelected
                      ? "border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10"
                      : "border-border/50 bg-background hover:bg-muted/30 hover:border-primary/20"
                  )}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="category-selected-bg"
                      className="absolute inset-0 bg-primary/5"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className={cn(
                    "relative size-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm",
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <Icon className="size-6" />
                  </div>
                  <span className={cn(
                    "relative text-sm font-semibold tracking-tight text-center",
                    isSelected ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                  )}>
                    {category.name}
                  </span>
                </ChoiceGroup.Item>
              </motion.div>
            )
          })}
        </ChoiceGroup>
      </div>
    </motion.div>
  )
}
