import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Briefcase, FileText, Loader2, Store, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  updateProfileSchema
} from '@/types/account-schemas'
import type {
  UpdateProfileInput} from '@/types/account-schemas';
import { useAuth } from '@/features/auth/hooks/use-auth'
import { updateProfileServerFn } from '@/fn/users'

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SellerSettings() {
  const { t } = useTranslation('dashboard/seller')
  const queryClient = useQueryClient()
  const { data: user } = useAuth()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      userId: user?.id || '',
      storeName: user?.storeName || '',
      companyAddress: user?.companyAddress || '',
      commercialRegister: user?.commercialRegister || '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        userId: user.id,
        storeName: user.storeName || '',
        companyAddress: user.companyAddress || '',
        commercialRegister: user.commercialRegister || '',
      })
    }
  }, [user, form])

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (values: UpdateProfileInput) => {
      return await (updateProfileServerFn as any)({ data: values })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success(t('settings.toasts.success'))
    },
    onError: () => {
      toast.error(t('settings.toasts.error'))
    },
  })

  function onSubmit(values: UpdateProfileInput) {
    updateProfile(values)
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden bg-white dark:bg-slate-950 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="border-b border-slate-50 dark:border-slate-900 p-8 md:p-10 bg-slate-50/30 dark:bg-slate-900/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Store className="size-6" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">{t('settings.title')}</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">
              {t('settings.desc')}
            </CardDescription>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
             <ShieldCheck className="size-4" />
             <span className="text-[10px] font-black uppercase tracking-wider">Verified Business</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 md:p-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl"
          >
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-slate-900 dark:text-slate-100">
                    <Briefcase className="size-3.5 text-primary" />{' '}
                    {t('settings.labels.store_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('settings.placeholders.store_name')}
                      className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="commercialRegister"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-slate-900 dark:text-slate-100">
                      <FileText className="size-3.5 text-primary" /> 
                      {t('settings.labels.rc_number')}
                    </FormLabel>
                    <FormControl>
                    <Input
                        placeholder={t('settings.placeholders.rc_number')}
                        className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-slate-900 dark:text-slate-100">
                      <Store className="size-3.5 text-primary" />{' '}
                      {t('settings.labels.address')}
                    </FormLabel>
                    <FormControl>
                    <Input
                        placeholder={t('settings.placeholders.address')}
                        className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-start pt-6">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="me-2 h-5 w-5 animate-spin" />
                ) : null}
                {isPending ? t('settings.labels.submitting') : t('settings.labels.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
