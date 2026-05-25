/* Hallmark · component: offline-page · genre: modern-minimal · theme: catalog-existing
 * states: offline · reconnecting · restored
 * contrast: pass (46–50)
 * P5 H4 E5 S4 R5 V4
 */
import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnlineStatus } from '@/hooks/use-online-status'

export function OfflinePage() {
  const isOnline = useOnlineStatus()
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const returnPath = search.from ?? '/'

  useEffect(() => {
    if (isOnline) {
      navigate({ to: returnPath as any })
    }
  }, [isOnline, navigate, returnPath])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="text-center max-w-xs mx-auto">
        {/* Pulsing rings + icon */}
        <div className="relative flex items-center justify-center mb-8 mx-auto w-fit">
          <span
            aria-hidden="true"
            className="absolute size-28 rounded-full animate-pulse"
            style={{ background: 'var(--muted)', opacity: 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute size-20 rounded-full animate-pulse [animation-delay:300ms]"
            style={{ background: 'var(--muted)', opacity: 0.5 }}
          />
          <div
            className="relative size-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <WifiOff
              className="size-7"
              strokeWidth={1.5}
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>
        </div>

        {/* Status pill */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 mb-5"
          style={{
            background: 'oklch(from var(--destructive) l c h / 0.08)',
            borderColor: 'oklch(from var(--destructive) l c h / 0.2)',
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: 'var(--destructive)' }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--destructive)' }}
          >
            Offline
          </span>
        </div>

        <h1
          className="text-xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          No internet connection
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Check your network settings and try again. This page will resume
          automatically when you reconnect.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="h-10 px-6 rounded-xl font-semibold text-sm cursor-pointer"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
