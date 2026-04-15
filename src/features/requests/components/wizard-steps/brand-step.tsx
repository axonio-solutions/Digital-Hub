'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useTaxonomy } from '@/features/taxonomy/hooks/use-taxonomy'
import type { ProductFormData } from '@/types/product-schemas'
import { ChoiceGroup } from '@/components/ui/onboarding'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Building2, Check } from 'lucide-react'

export function BrandStep() {
  const { t } = useTranslation('requests/form')
  const { data: taxonomy, isLoading } = useTaxonomy()
  const { setValue, watch } = useFormContext<ProductFormData>()

  const selectedBrandId = watch('brandId')

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
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
          <Building2 className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">
            {t('steps.brand.title')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('steps.brand.description')}
          </p>
        </div>
      </div>

      {/* Brand Grid */}
      <div className="max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}>
        <ChoiceGroup
          value={selectedBrandId}
          onValueChange={(v) => {
            setValue('brandId', v)
            const brand = taxonomy?.brands.find((b: any) => String(b.id) === String(v))
            if (brand) {
              setValue('vehicleBrand', brand.brand)
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {taxonomy?.brands.map((brand: any) => {
            const isSelected = String(selectedBrandId) === String(brand.id)

            return (
              <motion.div
                key={brand.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <ChoiceGroup.Item
                  value={brand.id}
                  className={cn(
                    'relative group flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 select-none cursor-pointer overflow-hidden',
                    isSelected
                      ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border/50 bg-background hover:bg-muted/30 hover:border-primary/20'
                  )}
                >
                  {/* Selection Check */}
                  {isSelected && (
                    <motion.div
                      layoutId="brand-check"
                      className="absolute top-1.5 right-1.5 size-4 bg-primary rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="size-2.5 text-white" />
                    </motion.div>
                  )}

                  {/* Brand Logo/Icon */}
                  <div className={cn(
                    "size-10 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0",
                    isSelected
                      ? "bg-primary/10 border-2 border-primary/30"
                      : "bg-muted/50 border border-border/50 group-hover:border-primary/20"
                  )}>
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.brand}
                        className={cn(
                          "size-6 object-contain transition-all",
                          !isSelected && "opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                        )}
                      />
                    ) : (
                      <span className={cn(
                        "text-sm font-bold transition-colors",
                        isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )}>
                        {(brand.brand ?? 'B').substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Brand Name */}
                  <span
                    className={cn(
                      'text-sm font-semibold truncate transition-colors',
                      isSelected ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'
                    )}
                  >
                    {brand.brand}
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
