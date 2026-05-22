import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { UpdateProfileInput } from '@/types/account-schemas'
import { updateProfileSchema } from '@/types/account-schemas'
import { useToast } from '@/hooks/use-toast'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const WILAYAS = [
  'Adrar',
  'Chlef',
  'Laghouat',
  'Oum El Bouaghi',
  'Batna',
  'Béjaïa',
  'Biskra',
  'Béchar',
  'Blida',
  'Bouira',
  'Tamanrasset',
  'Tébessa',
  'Tlemcen',
  'Tiaret',
  'Tizi Ouzou',
  'Alger',
  'Djelfa',
  'Jijel',
  'Sétif',
  'Saïda',
  'Skikda',
  'Sidi Bel Abbès',
  'Annabba',
  'Guelma',
  'Constantine',
  'Médéa',
  'Mostaganem',
  "M'Sila",
  'Mascara',
  'Ouargla',
  'Oran',
  'El Bayadh',
  'Illizi',
  'Bordj Bou Arréridj',
  'Boumerdès',
  'El Tarf',
  'Tindouf',
  'Tissemsilt',
  'El Oued',
  'Khenchela',
  'Souk Ahras',
  'Tipaza',
  'Mila',
  'Aïn Defla',
  'Naâma',
  'Aïn Témouchent',
  'Ghardaïa',
  'Relizane',
]

export function BuyerSettings() {
  const { t } = useTranslation('dashboard/settings')
  const { toast } = useToast('dashboard/settings')
  const queryClient = useQueryClient()
  const { data: user } = useAuth()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      userId: user?.id || '',
      wilaya: user?.wilaya || '',
      city: user?.city || '',
      address: user?.address || '',
      whatsappNumber: user?.whatsappNumber || '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        userId: user.id,
        wilaya: user.wilaya || '',
        city: user.city || '',
        address: user.address || '',
        whatsappNumber: user.whatsappNumber || '',
      })
    }
  }, [user, form])

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (values: UpdateProfileInput) => {
      return await (updateProfileServerFn as any)({ data: values })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('delivery.save', {
        description: 'delivery.desc',
      })
    },
    onError: () => {
      toast.error('messages.update_failed')
    },
  })

  function onSubmit(values: UpdateProfileInput) {
    updateProfile(values)
  }

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {t('delivery.title')}
        </CardTitle>
        <CardDescription>{t('delivery.desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-w-xl"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wilaya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('delivery.wilaya')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('delivery.wilaya_placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WILAYAS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('delivery.city')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('delivery.city_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('delivery.address')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('delivery.address_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('delivery.whatsapp')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('delivery.whatsapp_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isPending ? t('delivery.saving') : t('delivery.save')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
