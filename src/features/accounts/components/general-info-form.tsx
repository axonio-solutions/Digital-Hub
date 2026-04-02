import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Loader2, MapPin, User as UserIcon } from 'lucide-react'
import {
  updateProfileSchema
} from '@/types/account-schemas'
import type {
  UpdateProfileInput} from '@/types/account-schemas';
import { useAuth } from '@/features/auth/hooks/use-auth'
import { updateProfileServerFn } from '@/fn/users'
import { WILAYAS } from '@/lib/constants/wilayas'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// AvatarUpload removed for consolidation

export function GeneralInfoForm() {
  const queryClient = useQueryClient()
  const { data: user } = useAuth()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      userId: user?.id || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      whatsappNumber: user?.whatsappNumber || '',
      address: user?.address || '',
      city: user?.city || '',
      wilaya: user?.wilaya || 'Algiers',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        userId: user.id,
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        whatsappNumber: user.whatsappNumber || '',
        address: user.address || '',
        city: user.city || '',
        wilaya: user.wilaya || 'Algiers',
      })
    }
  }, [user, form])

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (values: UpdateProfileInput) => {
      return await (updateProfileServerFn as any)({ data: values })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('Profile Updated')
    },
    onError: () => {
      toast.error('Update Failed')
    },
  })

  function onSubmit(values: UpdateProfileInput) {
    updateProfile(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Card */}
        <Card className="border-primary/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              <CardTitle>Basic Identity</CardTitle>
            </div>
            <CardDescription>
              Update your avatar and personal contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-2 invisible h-0 overflow-hidden">
              {/* Avatar upload removed to avoid duplication with parent section */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>WhatsApp (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+213..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information Card */}
        <Card className="border-primary/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <CardTitle>Physical Address</CardTitle>
            </div>
            <CardDescription>
              Managed your primary location for deliveries and service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Street Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / Commune</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Cheraga" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wilaya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wilaya</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select wilaya" />
                        </SelectTrigger>
                      </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {WILAYAS.map((w) => (
                            <SelectItem key={w.id} value={w.name}>
                              {w.id} - {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="font-bold min-w-[120px]"
              >
                {isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : null}
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

