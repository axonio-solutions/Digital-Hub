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
      className="flex flex-col gap-4"
    >
      {/* Header Section */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
        <div className="size-9 rounded-lg bg-background border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
          <CarFront className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">
            {t('steps.vehicle_info.title')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('steps.vehicle_info.description')}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField
          control={control}
          name="vehicleModel"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-2">
                <CarFront className="size-3.5 text-primary" />
                {t('labels.model_version')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    placeholder={t('placeholders.model_version')}
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
          name="modelYear"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Calendar className="size-3.5 text-primary" />
                {t('labels.model_year')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    placeholder={t('placeholders.model_year')}
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

        <div className="sm:col-span-2">
          <FormField
            control={control}
            name="vinNumber"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="size-3.5 text-primary" />
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
                  <div className="relative group/vin">
                    <Input
                      placeholder={t('placeholders.vin_number')}
                      className="h-11 rounded-xl bg-background border-2 border-border/50 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200 font-mono text-xs tracking-widest pl-11 uppercase"
                      {...field}
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/vin:text-primary transition-colors">
                      <CarFront className="size-4" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within/vin:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-3.5 rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
      >
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-background border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
            <CarFront className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-bold uppercase text-primary tracking-wide mb-1">
              {t('steps.vehicle_info.why_title')}
            </h5>
            <p className="text-xs leading-relaxed text-muted-foreground/90 font-medium">
              {t('steps.vehicle_info.why_description')}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
