import { useForm } from 'react-hook-form'
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

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthInput = z.infer<typeof authSchema>

export function LoginForm() {
  const router = useRouter()

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
          throw new Error('Server connection error. Please check if the database is accessible.')
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
              throw new Error('Server connection error during sign up. Please try again later.')
            }

            // If sign up fails because user exists, it means the original sign in was a wrong password
            if (signUpError.code === 'USER_ALREADY_EXISTS') {
              console.log('[LoginForm] User already exists, must be a wrong password.')
              throw new Error('Invalid password. This email is already registered.')
            }

            throw new Error(signUpError.message || 'Failed to join')
          }

          console.log('[LoginForm] signUp.email successful')
          return signUpData
        }

        // Other sign in errors
        console.log('[LoginForm] Unhandled signIn error:', signInError)
        throw new Error(signInError.message || 'Authentication failed')
      }

      console.log('[LoginForm] signIn.email successful')
      return signInData
    },
    onSuccess: async () => {
      console.log('[LoginForm] Authentication flow complete, redirecting...')
      toast.success('Success!', {
        description: 'You have been authenticated.',
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
      toast.error('Auth Error', {
        description: error.message || 'Please check your credentials.',
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
          Sign In or Join
        </Button>
      </form>
    </Form>
  )
}
