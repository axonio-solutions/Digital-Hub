import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { Briefcase, FileText, Loader2, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { updateProfileSchema } from '@/types/account-schemas'
import type { UpdateProfileInput } from '@/types/account-schemas';
import { useAuth } from '@/features/auth/hooks/use-auth'
import { updateProfileServerFn } from '@/fn/users'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SellerSettings() {
  const { t } = useTranslation('dashboard/seller')
  const { toast } = useToast('dashboard/seller')
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
      toast.success('settings.toasts.success')
    },
    onError: () => {
      toast.error('settings.toasts.error')
    },
  })

  function onSubmit(values: UpdateProfileInput) {
    updateProfile(values)
  }

  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Store className="size-5 text-primary" />
          <CardTitle className="text-xl font-bold">{t('settings.title')}</CardTitle>
        </div>
        <CardDescription>{t('settings.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="size-4 text-primary" />
                    {t('settings.labels.store_name')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('settings.placeholders.store_name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commercialRegister"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      {t('settings.labels.rc_number')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.placeholders.rc_number')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Store className="size-4 text-primary" />
                      {t('settings.labels.address')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.placeholders.address')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending || !form.formState.isDirty} className="font-bold min-w-[120px]">
                {isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                {isPending ? t('settings.labels.submitting') : t('settings.labels.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
