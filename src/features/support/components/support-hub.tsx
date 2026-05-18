'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2,
  Headphones,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { submitSupportTicketServerFn } from '@/fn/support'
import { useAuth } from '@/features/auth/hooks/use-auth'

const formSchema = z.object({
  subject: z.string().min(3).max(200),
  category: z.string().min(1),
  message: z.string().min(10).max(5000),
})

export function SupportHub() {
  const { t } = useTranslation('dashboard/buyer')
  const { toast } = useToast('dashboard/buyer')
  const { data: user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      category: '',
      message: '',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return

    setIsSubmitting(true)
    try {
      const res = await submitSupportTicketServerFn({ data: values })
      if (!res.success) throw new Error(res.error)
      setIsSuccess(true)
      toast.success('support.form.success')
    } catch (error: any) {
      toast.error('support.form.error', { error: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-sm uppercase shadow-lg shadow-primary/20 shrink-0">
            <Headphones className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {t('support.title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {t('support.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                {t('support.form.success')}
              </h3>
              <Button
                variant="outline"
                onClick={() => { setIsSuccess(false); form.reset() }}
                className="mt-4"
              >
                {t('support.form.submit')}
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="size-4 text-primary" />
                    {t('support.form.subject')}
                  </h3>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('support.form.subject')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('support.form.subject_placeholder')}
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('support.form.category')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue
                                placeholder={t('support.form.category_placeholder')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['problem', 'request', 'support', 'other'].map(
                              (cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {t(`support.categories.${cat}`)}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('support.form.message')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('support.form.message_placeholder')}
                            className="min-h-[160px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 gap-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t('support.form.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      {t('support.form.submit')}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-4">
              {t('support.info.email')}
            </h3>
            <a
              href="mailto:support@mlila.dz"
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-colors',
                'bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10',
              )}
            >
              <Mail className="size-4 shrink-0" />
              <span className="text-sm font-bold">support@mlila.dz</span>
            </a>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              {t('support.info.response_time')}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-4">
              {t('support.info.phone')}
            </h3>
            <a
              href="tel:+213560000000"
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-colors',
                'bg-muted/50 border border-border hover:bg-muted',
              )}
            >
              <Phone className="size-4 shrink-0 text-primary" />
              <span className="text-sm font-bold">+213 560 00 00 00</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
