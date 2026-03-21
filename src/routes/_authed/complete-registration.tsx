import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authed/complete-registration')({
  component: CompleteRegistration,
})

function CompleteRegistration() {
  const { data: user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-20">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>
            Welcome {user?.name}! Please provide a few more details to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We will add the completion form here in the next step */}
          <p className="text-muted-foreground">
            Role: {user?.role} <br />
            Status: {user?.user_type}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
