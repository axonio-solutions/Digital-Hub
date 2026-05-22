import { AlertCircle } from 'lucide-react'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px] py-16">
      <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
        <AlertCircle className="size-7 text-red-500" />
      </div>
      <div className="text-center space-y-1.5 max-w-sm">
        <h3 className="text-lg font-black tracking-tight">
          Something went wrong
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          {error instanceof Error
            ? error.message
            : 'Failed to load this page. Please try again.'}
        </p>
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="h-10 px-5 rounded-xl font-bold text-xs uppercase tracking-wider"
      >
        Try again
      </Button>
    </div>
  )
}
