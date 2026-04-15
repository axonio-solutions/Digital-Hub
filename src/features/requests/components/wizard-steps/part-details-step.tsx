'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { Info, FileText, Tag } from 'lucide-react'
import type { ProductFormData } from '@/types/product-schemas'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'

export function PartDetailsStep() {
  const { t } = useTranslation('requests/form')
  const { control } = useFormContext<ProductFormData>()

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
          <FileText className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">
            {t('steps.part_details.title')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('steps.part_details.description')}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5">
        <FormField
          control={control}
          name="partName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Tag className="size-3.5 text-primary" />
                {t('labels.part_name')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    placeholder={t('placeholders.part_name')}
                    className="h-11 rounded-xl bg-background border-2 border-border/50 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200 pr-4 text-sm font-medium"
                    {...field}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Info className="size-3.5 text-primary" />
                {t('labels.description')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Textarea
                    placeholder={t('placeholders.description')}
                    className="min-h-[100px] rounded-xl bg-background border-2 border-border/50 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200 resize-none p-3.5 leading-relaxed text-sm"
                    {...field}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </FormControl>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('hints.description_help')}
                </p>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  )
}
