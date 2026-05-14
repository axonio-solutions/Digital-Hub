'use client'

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useTaxonomy } from '@/features/taxonomy/hooks/use-taxonomy'
import type { ProductFormData } from '@/types/product-schemas'
import { Building2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const POPULAR_BRANDS = [
  'Renault', 'Peugeot', 'Toyota', 'Hyundai', 'Volkswagen',
  'Dacia', 'Ford', 'Nissan', 'BMW', 'Mercedes-Benz',
]

function BrandItem({ brand, isSelected }: { brand: any; isSelected: boolean }) {
  return (
    <div className="relative">
      <RadioGroupItem
        value={brand.id}
        id={`brand-${brand.id}`}
        className="peer sr-only"
      />
      <Label
        htmlFor={`brand-${brand.id}`}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm rtl:flex-row-reverse',
          'hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-sm',
          isSelected && 'border-primary bg-primary/5 shadow-sm'
        )}
      >
        <div
          className={cn(
            'size-10 rounded-lg flex items-center justify-center shrink-0 transition-all',
            isSelected
              ? 'bg-primary/10 border-2 border-primary/30'
              : 'bg-muted border border-border'
          )}
        >
          {brand.imageUrl ? (
            <img
              src={brand.imageUrl}
              alt={brand.brand}
              className={cn(
                'size-6 object-contain transition-all',
                !isSelected && 'opacity-60 grayscale'
              )}
            />
          ) : (
            <span className={cn(
              'text-sm font-bold',
              isSelected ? 'text-primary' : 'text-muted-foreground'
            )}>
              {(brand.brand ?? 'B').substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <span className={cn(
          'text-sm font-semibold truncate',
          isSelected ? 'text-primary' : 'text-foreground'
        )}>
          {brand.brand}
        </span>
      </Label>
      {isSelected && (
        <div className="absolute top-2 end-2 size-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="size-3 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}

export function BrandStep() {
  const { t } = useTranslation('requests/form')
  const { data: taxonomy, isLoading } = useTaxonomy()
  const { setValue, watch } = useFormContext<ProductFormData>()

  const selectedBrandId = watch('brandId')

  const sortedBrands = useMemo(() => {
    if (!taxonomy?.brands) return []
    const popular: any[] = []
    const others: any[] = []
    for (const b of taxonomy.brands) {
      if (POPULAR_BRANDS.includes(b.brand)) popular.push(b)
      else others.push(b)
    }
    popular.sort((a, b) => POPULAR_BRANDS.indexOf(a.brand) - POPULAR_BRANDS.indexOf(b.brand))
    others.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''))
    return { popular, others }
  }, [taxonomy?.brands])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{t('steps.brand.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('steps.brand.description')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
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
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 rtl:flex-row-reverse">
          <Building2 className="size-5 text-primary shrink-0" />
          <span>{t('steps.brand.title')}</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('steps.brand.description')}
        </p>
      </div>

      <RadioGroup
        value={selectedBrandId || ''}
        onValueChange={(value) => {
          setValue('brandId', value)
          const brand = taxonomy?.brands.find((b: any) => String(b.id) === String(value))
          if (brand) {
            setValue('vehicleBrand', brand.brand)
          }
        }}
        className="flex flex-col gap-4 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}
      >
        {sortedBrands.popular.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2 px-0.5 rtl:text-end">
              {t('steps.brand.popular', 'Popular')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 rtl:[direction:rtl]">
              {sortedBrands.popular.map((brand: any) => (
                <BrandItem
                  key={brand.id}
                  brand={brand}
                  isSelected={String(selectedBrandId) === String(brand.id)}
                />
              ))}
            </div>
          </div>
        )}

        {sortedBrands.others.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2 px-0.5 rtl:text-end">
              {t('steps.brand.all_brands', 'All Brands')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 rtl:[direction:rtl]">
              {sortedBrands.others.map((brand: any) => (
                <BrandItem
                  key={brand.id}
                  brand={brand}
                  isSelected={String(selectedBrandId) === String(brand.id)}
                />
              ))}
            </div>
          </div>
        )}
      </RadioGroup>
    </motion.div>
  )
}
