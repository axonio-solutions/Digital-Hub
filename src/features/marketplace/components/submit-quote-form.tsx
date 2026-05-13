'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Send, ShieldCheck, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { QuoteInput } from '@/types/quote-schemas'
import { quoteSchema } from '@/types/quote-schemas'
import { useSubmitQuote, useUpdateQuote } from '@/features/marketplace/hooks/use-marketplace'
import { tCategory } from '@/utils/category-utils'
import { CategoryDisplay } from '@/components/ui/category-display'

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

interface SubmitQuoteFormProps {
  quoteId?: string
  requestId: string
  sellerId: string
  requestImages?: Array<string>
  vehicleInfo?: { brand: string; model: string; year: string }
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
  vehicleInfo,
  category,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4', !isCompact && 'space-y-5')}>
        {showContext && vehicleInfo && (
          <div className="flex flex-wrap items-center gap-4 justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {vehicleInfo.brand} {vehicleInfo.model}
                </p>
                <p className="text-xs text-muted-foreground">Year: {vehicleInfo.year}</p>
              </div>
            </div>
            {category && (
              <span className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bold text-foreground inline-flex items-center gap-1.5">
                <CategoryDisplay category={category} showName={false} iconClassName="size-3" />
                {tCategory(category, t)}
              </span>
            )}
          </div>
        )}

        <div className={cn(
          !isCompact && "bg-muted/30 rounded-xl p-5 border border-border"
        )}>
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground flex items-center gap-2">
                  {t('form.price_label')}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15 font-bold">
                    DZD
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      className={cn(
                        'pl-4 font-mono font-bold rounded-xl border-2 border-border bg-card focus:border-primary transition-all',
                        isCompact ? 'h-12 text-xl' : 'h-14 text-2xl',
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Warranty */}
          <FormField
            control={form.control}
            name="warranty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  {t('form.warranty_label')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.warranty_placeholder')}
                    {...field}
                    className={cn(
                      'rounded-xl border-2 border-border bg-card focus:border-primary transition-all font-medium',
                      isCompact ? 'h-10' : 'h-12',
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Condition */}
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">
                  {t('form.condition_label')}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-3"
                  >
                    <label
                      htmlFor="cond-new"
                      className={cn(
                        'cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all',
                        isCompact ? 'h-12' : 'h-16',
                        field.value === 'new'
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/30',
                      )}
                    >
                      <RadioGroupItem value="new" id="cond-new" className="sr-only" />
                      <span className={cn(
                        'font-bold uppercase tracking-wide',
                        isCompact ? 'text-xs' : 'text-sm',
                        field.value === 'new' ? 'text-primary' : 'text-muted-foreground',
                      )}>
                        {t('form.condition_new')}
                      </span>
                    </label>

                    <label
                      htmlFor="cond-used"
                      className={cn(
                        'cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all',
                        isCompact ? 'h-12' : 'h-16',
                        field.value === 'used'
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/30',
                      )}
                    >
                      <RadioGroupItem value="used" id="cond-used" className="sr-only" />
                      <span className={cn(
                        'font-bold uppercase tracking-wide',
                        isCompact ? 'text-xs' : 'text-sm',
                        field.value === 'used' ? 'text-primary' : 'text-muted-foreground',
                      )}>
                        {t('form.condition_used')}
                      </span>
                    </label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            'w-full rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-primary/20',
            isCompact ? 'h-11' : 'h-13',
          )}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 me-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 me-2" />
          )}
          {isEditing ? t('form.update_btn') : t('form.submit_btn')}
        </Button>
      </form>
    </Form>
  )
}
