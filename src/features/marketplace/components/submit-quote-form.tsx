'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { 
  Activity,
  ChevronRight,
  Hexagon,
  Info,
  Loader2, 
  Send, 
  Settings, 
  ShieldCheck, 
  Tag, 
  Zap
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import type { QuoteInput } from '@/types/quote-schemas'
import { quoteSchema } from '@/types/quote-schemas'
import { useSubmitQuote, useUpdateQuote } from '@/features/marketplace/hooks/use-marketplace'
import { tCategory } from '@/utils/category-utils'

import { ImageSlider } from '@/components/ui/image-slider'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface SubmitQuoteFormProps {
  quoteId?: string
  requestId: string
  sellerId: string
  requestImages?: Array<string>
  vehicleInfo?: {
    brand: string
    model: string
    year: string
  }
  category?: string
  oemNumber?: string
  notes?: string
  initialData?: Partial<QuoteInput>
  onSuccess: () => void
  layout?: 'default' | 'compact'
  showContext?: boolean
}

export function SubmitQuoteForm({
  quoteId,
  requestId,
  sellerId,
  requestImages = [],
  vehicleInfo,
  category,
  oemNumber,
  notes,
  initialData,
  onSuccess,
  layout = 'default',
  showContext = true,
}: SubmitQuoteFormProps) {
  const { t } = useTranslation('marketplace')
  const form = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      requestId,
      sellerId,
      price: initialData?.price || 0,
      condition: (initialData?.condition as any) || 'used',
      warranty: initialData?.warranty || '',
    },
  })

  const { mutate: submitQuote, isPending: isSubmitting } = useSubmitQuote()
  const { mutate: updateQuote, isPending: isUpdating } = useUpdateQuote()

  const isPending = isSubmitting || isUpdating
  const isEditing = !!quoteId
  const isCompact = layout === 'compact'

  function onSubmit(values: QuoteInput) {
    if (isEditing && quoteId) {
      updateQuote(
        { id: quoteId, data: values },
        {
          onSuccess: () => {
            toast.success(t('toasts.update_success'))
            onSuccess()
          },
          onError: (err: any) => {
            toast.error(t('toasts.update_error'), { description: err.message })
          },
        }
      )
    } else {
      submitQuote(values, {
        onSuccess: () => {
          toast.success(t('toasts.submit_success'))
          onSuccess()
        },
        onError: (err: any) => {
          toast.error(t('toasts.submit_error'), { description: err.message })
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {showContext && (
          <div className={cn(
            "grid grid-cols-1 gap-6 items-start",
            !isCompact && "lg:grid-cols-12 lg:gap-8"
          )}>
            {/* Visual Specs Column */}
            <div className={cn(
              "space-y-6",
              !isCompact && "lg:col-span-12"
            )}>
              {/* Technical Header */}
              <div className="flex flex-wrap items-center gap-4 justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Settings className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tighter leading-none">{t('form.part_name')}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase mt-1">Ref: {requestId.slice(0, 8)}</p>
                  </div>
                </div>

                {oemNumber && (
                  <div className="px-3 py-1.5 rounded-md bg-secondary border border-border flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs font-bold">{oemNumber}</span>
                  </div>
                )}
              </div>

              <div className={cn(
                "grid grid-cols-1 gap-6",
                !isCompact && "md:grid-cols-2"
              )}>
                {/* Visual Context */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl">
                    <ImageSlider images={requestImages} aspectRatio="video" className="w-full" />
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Scanning Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spec details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 flex flex-col justify-between">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('form.category')}</div>
                    <div className="mt-2 text-sm font-black uppercase leading-tight">{tCategory(category, t)}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 flex flex-col justify-between">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('form.vehicle')}</div>
                    <div className="mt-2 text-sm font-black uppercase leading-tight">
                      {vehicleInfo?.brand} {vehicleInfo?.model}
                      <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">Y:{vehicleInfo?.year}</span>
                    </div>
                  </div>

                  {notes && (
                    <div className="col-span-2 p-4 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Info className="w-8 h-8" />
                      </div>
                      <div className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{t('form.note')}</div>
                      <p className="text-sm italic font-medium text-slate-600 dark:text-slate-400">"{notes}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The Offer Console */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-1 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]",
          isCompact && "border-none shadow-none bg-transparent p-0"
        )}>
          <div className={cn(
            "relative bg-slate-50 dark:bg-slate-900/50 rounded-[calc(1.5rem-2px)] p-6 space-y-8",
            isCompact && "bg-transparent p-0"
          )}>
            {/* Console Header */}
            {!isCompact && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hexagon className="w-5 h-5 text-primary fill-primary/10" />
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-foreground italic">{t('form.your_offer')}</h4>
                </div>
                <div className="h-[2px] w-24 bg-gradient-to-r from-primary to-transparent"></div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              {/* Digital Price Input */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <FormLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-2">
                        {t('form.price_label')} 
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">DZD</span>
                      </FormLabel>
                      {field.value > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[10px] font-mono text-emerald-500 font-bold"
                        >
                          VAL: VALIDATED
                        </motion.div>
                      )}
                    </div>
                    <FormControl>
                      <div className="relative group/price">
                        <div className="absolute inset-y-0 left-4 flex items-center justify-center pointer-events-none z-10">
                          <Zap className="w-5 h-5 text-primary opacity-50 group-focus-within/price:opacity-100 transition-opacity" />
                        </div>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          className="h-16 pl-12 text-3xl font-mono font-black rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-primary transition-all shadow-inner"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Warranty Certification */}
              <FormField
                control={form.control}
                name="warranty"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" />
                      {t('form.warranty_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.warranty_placeholder')}
                        {...field}
                        className="h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-primary transition-all font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Condition Toggle Panel */}
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t('form.condition_label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <label
                        htmlFor="cond-new"
                        className={cn(
                          "relative group cursor-pointer h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                          field.value === 'new'
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50'
                        )}
                      >
                        <RadioGroupItem value="new" id="cond-new" className="sr-only" />
                        <span className={cn(
                          "text-xs font-black uppercase tracking-[0.2em]",
                          field.value === 'new' ? 'text-primary' : 'text-muted-foreground opacity-50'
                        )}>
                          {t('form.condition_new')}
                        </span>
                        <div className={cn(
                          "w-8 h-1 rounded-full bg-primary transition-all duration-500 scale-x-0 origin-center",
                          field.value === 'new' && "scale-x-100"
                        )}></div>
                        {field.value === 'new' && (
                          <motion.div layoutId="condition-active" className="absolute inset-0 bg-primary/5 rounded-xl z-[-1]" />
                        )}
                      </label>

                      <label
                        htmlFor="cond-used"
                        className={cn(
                          "relative group cursor-pointer h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                          field.value === 'used'
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50'
                        )}
                      >
                        <RadioGroupItem value="used" id="cond-used" className="sr-only" />
                        <span className={cn(
                          "text-xs font-black uppercase tracking-[0.2em]",
                          field.value === 'used' ? 'text-primary' : 'text-muted-foreground opacity-50'
                        )}>
                          {t('form.condition_used')}
                        </span>
                        <div className={cn(
                          "w-8 h-1 rounded-full bg-primary transition-all duration-500 scale-x-0 origin-center",
                          field.value === 'used' && "scale-x-100"
                        )}></div>
                         {field.value === 'used' && (
                          <motion.div layoutId="condition-active" className="absolute inset-0 bg-primary/5 rounded-xl z-[-1]" />
                        )}
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Industrial Action Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className={cn(
                  "relative w-full h-16 rounded-2xl overflow-hidden group/btn transition-all duration-300",
                  "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black uppercase tracking-[0.4em] text-sm",
                  "hover:shadow-[0_0_30px_-5px_oklch(var(--primary))] active:scale-[0.98]",
                  isPending && "opacity-80"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-indigo-600/80 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                
                <span className="relative flex items-center justify-center gap-3 z-10 transition-transform duration-300 group-hover/btn:scale-110">
                  {isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <Send className={cn("h-5 w-5", "group-hover/btn:translate-x-1 transition-transform")} />
                  )}
                  {isEditing ? t('form.update_btn') : t('form.submit_btn')}
                </span>

                <div className="absolute bottom-0 left-0 h-[3px] bg-primary group-hover/btn:w-full transition-all duration-500 w-0"></div>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
