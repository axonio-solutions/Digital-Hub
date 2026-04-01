import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AvatarUpload } from '@/features/upload/components/avatar-upload'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

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
            Welcome {user?.name}! Please provide a few more details to activate
            your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <AvatarUpload
            userId={user?.id || ''}
            currentImage={user?.image}
            name={user?.name}
          />
          
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              A profile picture helps other users recognize you.
            </p>
            <div className="pt-4">
              <Button asChild className="w-full sm:w-auto font-bold">
                <Link to="/dashboard">
                  Continue to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
