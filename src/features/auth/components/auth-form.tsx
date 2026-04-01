import { LoginForm } from './login-form'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * Axis Layer 1: Unified Auth Container
 * This component orchestrates the high-level UI for Auth
 */

export function AuthForm({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome to MLILA</CardTitle>
          <CardDescription>
            Enter your email and password to proceed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-4">
            <LoginForm />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
