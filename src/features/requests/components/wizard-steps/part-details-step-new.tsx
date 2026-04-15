'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { FileText, Tag, Info } from 'lucide-react'
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
      className="flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          What part do you need?
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide clear details about the part you're looking for.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="partName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                {t('labels.part_name')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('placeholders.part_name')}
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Info className="size-4 text-primary" />
                {t('labels.description')}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('placeholders.description')}
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="size-3.5 shrink-0 mt-0.5" />
                {t('hints.description_help')}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  )
}
