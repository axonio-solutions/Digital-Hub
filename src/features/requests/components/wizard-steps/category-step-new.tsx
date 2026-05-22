'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Check, LayoutGrid } from 'lucide-react'
import type { RequestFormData } from '@/types/request-schemas'
import { useTaxonomy } from '@/features/taxonomy/hooks/use-taxonomy'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { DirectionProvider } from '@/components/ui/direction'
import { getCategoryImageUrl } from '@/utils/category-icons'
import { tCategory, tCategoryDescription } from '@/utils/category-utils'

function getInitials(name: string): string {
  const parts = name.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

export function CategoryStep() {
  const { t, i18n } = useTranslation('requests/form')
  const dir = i18n.dir()
  const { data: taxonomy, isLoading } = useTaxonomy()
  const { setValue, watch } = useFormContext<RequestFormData>()

  const selectedCategoryId = watch('categoryId')

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="space-y-1">
          <Skeleton className="h-7 w-44 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
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
          {t('steps.category.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('steps.category.description')}
        </p>
      </div>

      <DirectionProvider dir={dir}>
        <RadioGroup
          value={selectedCategoryId || ''}
          onValueChange={(value) => setValue('categoryId', value)}
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {taxonomy?.categories.map((category) => {
              const isSelected = selectedCategoryId === category.id
              const imageUrl = getCategoryImageUrl(category)
              const initials = getInitials(category.name)

              return (
                <motion.div key={category.id} variants={item}>
                  <div className="relative">
                    <RadioGroupItem
                      value={category.id}
                      id={`category-${category.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className={cn(
                        'relative flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none flex-row',
                        'hover:bg-muted/40',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-1',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/5'
                          : 'border-border hover:border-border/80',
                      )}
                    >
                      {/* Icon / Image */}
                      <div
                        className={cn(
                          'size-11 rounded-xl flex items-center justify-center shrink-0 transition-all',
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="size-6 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold">{initials}</span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                        <span
                          className={cn(
                            'text-sm font-semibold leading-tight truncate',
                            isSelected ? 'text-primary' : 'text-foreground',
                          )}
                        >
                          {tCategory(category.name, t)}
                        </span>
                        {(tCategoryDescription(category, t) ||
                          category.description) && (
                          <span className="text-xs text-muted-foreground/70 leading-tight line-clamp-1 text-start">
                            {tCategoryDescription(category, t) ||
                              category.description}
                          </span>
                        )}
                      </div>

                      {/* Selected check */}
                      <div
                        className={cn(
                          'size-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
                          isSelected
                            ? 'bg-primary scale-100 opacity-100'
                            : 'bg-muted-foreground/10 scale-75 opacity-0',
                        )}
                      >
                        <Check className="size-3.5 text-primary-foreground" />
                      </div>
                    </Label>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </RadioGroup>
      </DirectionProvider>
    </motion.div>
  )
}
