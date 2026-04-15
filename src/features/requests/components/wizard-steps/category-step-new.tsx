'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useTaxonomy } from '@/features/taxonomy/hooks/use-taxonomy'
import type { ProductFormData } from '@/types/product-schemas'
import {
  Car,
  Settings,
  Zap,
  ShieldCheck,
  Search,
  Wrench,
  Disc,
  Filter,
  LayoutGrid,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

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
        <div>
          <h3 className="text-lg font-semibold mb-1">Select Category</h3>
          <p className="text-sm text-muted-foreground">
            Choose the category that best matches the part you need.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
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
      className="flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <LayoutGrid className="size-5 text-primary" />
          Select Category
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the category that best matches the part you need.
        </p>
      </div>

      <RadioGroup
        value={selectedCategoryId || ''}
        onValueChange={(value) => setValue('categoryId', value)}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}
      >
        {taxonomy?.categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.slug] || CATEGORY_ICONS['other']
          const isSelected = selectedCategoryId === category.id

          return (
            <div key={category.id} className="relative">
              <RadioGroupItem
                value={category.id}
                id={`category-${category.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`category-${category.id}`}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm',
                  'hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-sm',
                  isSelected && 'border-primary bg-primary/5 shadow-sm'
                )}
              >
                <div
                  className={cn(
                    'size-12 rounded-lg flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <span className={cn(
                  'text-sm font-semibold text-center leading-tight',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {category.name}
                </span>
              </Label>
              {isSelected && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="size-3 text-primary-foreground" />
                </div>
              )}
            </div>
          )
        })}
      </RadioGroup>
    </motion.div>
  )
}
