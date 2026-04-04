import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Briefcase, FileText, Loader2, Store } from 'lucide-react'
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
      toast.success('Business Details Saved')
    },
    onError: () => {
      toast.error('Update Failed')
    },
  })

  function onSubmit(values: UpdateProfileInput) {
    updateProfile(values)
  }

  return (
    <Card className="border shadow-sm overflow-hidden bg-card">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Store className="size-5 text-primary" />
          <CardTitle className="text-xl font-bold">Business Credentials</CardTitle>
        </div>
        <CardDescription>
          Managed your official store identity and legal registration.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-2xl"
          >
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-bold mb-1">
                    <Briefcase className="size-3 text-muted-foreground" />{' '}
                    Display Store Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. DZ Parts Pro"
                      {...field}
                    />
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
                    <FormLabel className="flex items-center gap-2 font-bold mb-1">
                      <FileText className="size-3 text-muted-foreground" /> RC
                      Number
                    </FormLabel>
                    <FormControl>
                    <Input
                        placeholder="00A1234567-00/00"
                        {...field}
                      />
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
                    <FormLabel className="flex items-center gap-2 font-bold mb-1">
                      <Store className="size-3 text-muted-foreground" />{' '}
                      Physical Shop Address
                    </FormLabel>
                    <FormControl>
                    <Input
                        placeholder="Full street address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="font-bold min-w-[150px] shadow-lg shadow-primary/20"
              >
                {isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : null}
                {isPending ? 'Updating Store...' : 'Update Store Profile'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
