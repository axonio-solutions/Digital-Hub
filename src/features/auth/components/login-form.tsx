import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

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

type AuthInput = z.infer<typeof authSchema>

export function LoginForm() {
  const { t } = useTranslation('auth/login')
  const router = useRouter()

  const authSchema = z.object({
    email: z.string().email(t('login.errors.invalid_email')),
    password: z.string().min(6, t('login.errors.invalid_password')),
  })

  const form = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { mutate: handleAuth, isPending } = useMutation({
    mutationFn: async (values: AuthInput) => {
      console.log('[LoginForm] Starting authentication for:', values.email)
      // 1. Try to sign in
      console.log('[LoginForm] Attempting signIn.email...')
      const { data: signInData, error: signInError } =
        await authClient.signIn.email({
          email: values.email,
          password: values.password,
        })

      if (signInError) {
        console.log('[LoginForm] signIn.email error object:', signInError)
        const status = (signInError as any).status

        if (status === 500) {
          throw new Error(t('login.errors.server_error'))
        }

        // 2. If generic auth error, try to sign up (Universal Join logic)
        if (
          signInError.code === 'USER_NOT_FOUND' ||
          signInError.code === 'INVALID_EMAIL_OR_PASSWORD'
        ) {
          console.log('[LoginForm] User not found or invalid credentials, attempting signUp.email...')
          const { data: signUpData, error: signUpError } =
            await authClient.signUp.email({
              email: values.email,
              password: values.password,
              name: values.email.split('@')[0], // Default name from email prefix
            })

          if (signUpError) {
            console.log('[LoginForm] signUp.email error object:', signUpError)
            const signUpStatus = (signUpError as any).status

            if (signUpStatus === 500) {
              throw new Error(t('login.errors.signup_error'))
            }

            // If sign up fails because user exists, it means the original sign in was a wrong password
            if (signUpError.code === 'USER_ALREADY_EXISTS') {
              console.log('[LoginForm] User already exists, must be a wrong password.')
              throw new Error(t('login.errors.user_exists'))
            }

            throw new Error(signUpError.message || 'Failed to join')
          }

          console.log('[LoginForm] signUp.email successful')
          return signUpData
        }

        // Other sign in errors
        console.log('[LoginForm] Unhandled signIn error:', signInError)
        throw new Error(signInError.message || t('login.errors.auth_failed'))
      }

      console.log('[LoginForm] signIn.email successful')
      return signInData
    },
    onSuccess: async () => {
      console.log('[LoginForm] Authentication flow complete, redirecting...')
      toast.success(t('login.toasts.success_title'), {
        description: t('login.toasts.success_desc'),
      })

      // We do not need to manually refetch queries or invalidate the router here
      // because we are doing a hard redirect. This guarantees a clean application
      // state (auth context, hooks, router guards) for the authenticated session.
      
      const search = router.state.location.search as { redirect?: string }
      const redirectUrl = search?.redirect || '/dashboard'
      
      // Perform a hard redirect to bypass stale TanStack Router context caches
      window.location.href = redirectUrl
    },
    onError: (error: Error) => {
      toast.error(t('login.toasts.error_title'), {
        description: error.message || t('login.errors.check_credentials'),
      })
    },
  })

  function onSubmit(values: AuthInput) {
    handleAuth(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.email_label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('login.email_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.password_label')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t('login.password_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
          {t('login.submit_btn')}
        </Button>
      </form>
    </Form>
  )
}
