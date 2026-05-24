import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnlineStatus } from '@/hooks/use-online-status'

export function OfflinePage() {
  const isOnline = useOnlineStatus()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { from?: string }
  const returnPath = search.from ?? '/'

  useEffect(() => {
    if (isOnline) {
      navigate({ to: returnPath as any })
    }
  }, [isOnline, navigate, returnPath])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md mx-auto">
        <div className="size-20 rounded-3xl bg-muted flex items-center justify-center mx-auto">
          <WifiOff className="size-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            You&apos;re offline
          </h1>
          <p className="text-muted-foreground">
            Check your internet connection and try again. The page will
            automatically reload when you&apos;re back online.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="h-11 px-8 rounded-xl font-bold"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
