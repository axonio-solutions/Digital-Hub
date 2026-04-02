'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Send, Layout, Hash, Info, FileText } from 'lucide-react'
import type { QuoteInput } from '@/types/quote-schemas'
import { quoteSchema } from '@/types/quote-schemas'
import { useSubmitQuote, useUpdateQuote } from '@/features/marketplace/hooks/use-marketplace'

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface SubmitQuoteFormProps {
  quoteId?: string
  requestId: string
  sellerId: string
  requestImages?: string[]
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
}: SubmitQuoteFormProps) {
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

  function onSubmit(values: QuoteInput) {
    if (isEditing && quoteId) {
      updateQuote(
        { id: quoteId, data: values },
        {
          onSuccess: () => {
            toast.success('Quote updated successfully')
            onSuccess()
          },
          onError: (err: any) => {
            toast.error('Update failed', { description: err.message })
          },
        }
      )
    } else {
      submitQuote(values, {
        onSuccess: () => {
          toast.success('Quote submitted successfully')
          onSuccess()
        },
        onError: (err: any) => {
          toast.error('Submission failed', { description: err.message })
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          <div className="space-y-4">
             <div className="rounded-lg overflow-hidden border">
                <ImageSlider images={requestImages} aspectRatio="video" className="w-full" />
             </div>

             <Card className="bg-muted/50 shadow-none border-none">
                <CardHeader className="py-3">
                   <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                      <Layout className="h-3 w-3" /> Demand Context
                   </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-4 space-y-3">
                   <div>
                     <div className="text-[10px] font-black uppercase text-primary/60 mb-0.5 tracking-tight">Part Category</div>
                     <div className="font-black text-lg uppercase leading-tight">{category || 'General Component'}</div>
                   </div>
                   
                   <div className="pt-2 border-t border-dashed border-muted-foreground/20">
                     <div className="text-[10px] font-bold uppercase text-muted-foreground mb-0.5">Compatible Vehicle</div>
                     <div className="text-sm font-bold">{vehicleInfo?.brand} {vehicleInfo?.model} ({vehicleInfo?.year})</div>
                   </div>
                </CardContent>
             </Card>

             {oemNumber && (
               <Card className="bg-primary/5 shadow-none border-primary/20">
                  <CardHeader className="py-3">
                     <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide text-primary">
                        <Hash className="h-4 w-4" /> OEM ID
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0 pb-3">
                     <div className="font-mono font-bold text-lg">{oemNumber}</div>
                  </CardContent>
               </Card>
             )}
          </div>

          <Card className="shadow-lg">
             <CardHeader>
                <CardTitle className="text-lg">Your Offer</CardTitle>
                <CardDescription>Enter the details for your quote.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Price (DZD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter price"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          className="h-12 text-xl font-bold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Condition</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <Label
                            htmlFor="cond-new"
                            className={cn(
                              "flex-1 h-12 rounded-lg border-2 flex items-center justify-center gap-2 transition-all cursor-pointer",
                              field.value === 'new' 
                                ? 'border-primary bg-primary/5 font-bold' 
                                : 'border-muted hover:bg-muted/50'
                            )}
                          >
                            <RadioGroupItem value="new" id="cond-new" className="sr-only" />
                            New
                          </Label>

                          <Label
                            htmlFor="cond-used"
                            className={cn(
                              "flex-1 h-12 rounded-lg border-2 flex items-center justify-center gap-2 transition-all cursor-pointer",
                              field.value === 'used' 
                                ? 'border-primary bg-primary/5 font-bold' 
                                : 'border-muted hover:bg-muted/50'
                            )}
                          >
                            <RadioGroupItem value="used" id="cond-used" className="sr-only" />
                            Used
                          </Label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Warranty</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 6 Months"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2 text-[10px] text-muted-foreground italic flex items-center gap-1.5">
                   <FileText className="h-3 w-3" /> Note: {notes || "No buyer notes."}
                </div>
             </CardContent>
             <CardFooter>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="me-2 h-4 w-4" />
                  )}
                  {isEditing ? 'Update Quote' : 'Submit Quote'}
                </Button>
             </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  )
}
