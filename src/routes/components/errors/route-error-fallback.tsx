/* Hallmark · component: route-error-fallback · genre: modern-minimal · theme: catalog-existing
 * states: error · retrying
 * contrast: pass (46–50)
 * P5 H4 E5 S4 R5 V4
 */
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  const message =
    error instanceof Error
      ? error.message
      : 'Failed to load this page. Please try again.'

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 min-h-[400px] py-16 px-4">
      {/* Error icon */}
      <div
        className="size-12 rounded-xl flex items-center justify-center"
        style={{ background: 'oklch(from var(--destructive) l c h / 0.08)' }}
      >
        <AlertCircle
          className="size-5"
          strokeWidth={1.5}
          style={{ color: 'var(--destructive)' }}
        />
      </div>

      {/* Message */}
      <div className="text-center space-y-1.5 max-w-sm">
        <h3
          className="text-base font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          Something went wrong
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={reset}
          variant="outline"
          className="h-9 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider gap-1.5 cursor-pointer"
        >
          <RefreshCw className="size-3.5" strokeWidth={1.5} />
          Try again
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-9 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider gap-1.5 cursor-pointer"
        >
          <Link to="/">
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
