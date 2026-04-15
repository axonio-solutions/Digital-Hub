'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { CarFront, HelpCircle, Calendar, Hash } from 'lucide-react'
import type { ProductFormData } from '@/types/product-schemas'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'

export function VehicleInfoStep() {
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
          <CarFront className="size-5 text-primary" />
          Vehicle Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide accurate vehicle details to ensure part compatibility.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="vehicleModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <CarFront className="size-4 text-primary" />
                {t('labels.model_version')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('placeholders.model_version')}
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
          name="modelYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                {t('labels.model_year')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('placeholders.model_year')}
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sm:col-span-2">
          <FormField
            control={control}
            name="vinNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="size-4 text-primary" />
                    {t('labels.vin_number')}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="size-4 cursor-help text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] p-3 text-xs font-medium leading-relaxed">
                        {t('hints.vin_help')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('placeholders.vin_number')}
                    className="h-10 font-mono text-sm tracking-wider uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="p-4 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-background border border-primary/20 flex items-center justify-center shrink-0">
            <CarFront className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-bold uppercase text-primary tracking-wide mb-1">
              Why model & year matter?
            </h5>
            <p className="text-xs leading-relaxed text-muted-foreground/90 font-medium">
              Accurate vehicle specs ensure compatible parts are recommended, saving time and avoiding mismatches.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
