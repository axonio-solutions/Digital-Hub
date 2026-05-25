/* Hallmark · component: 404-page · genre: modern-minimal · theme: catalog-existing
 * contrast: pass (46–50)
 * P5 H5 E5 S4 R5 V4
 */
import { Link } from '@tanstack/react-router'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DefaultNotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      <div className="relative w-full max-w-md mx-auto text-center">
        {/* Large decorative "404" behind content */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none"
        >
          <span
            className="font-black leading-none tracking-tighter"
            style={{
              fontSize: 'clamp(8rem, 30vw, 16rem)',
              color: 'var(--foreground)',
              opacity: 0.04,
              fontFamily: 'var(--font-display)',
            }}
          >
            404
          </span>
        </div>

        {/* Content */}
        <div className="relative py-24">
          <div
            className="size-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--muted)' }}
          >
            <SearchX
              className="size-6"
              strokeWidth={1.5}
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>

          <h1
            className="text-2xl font-bold tracking-tight mb-2"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Page not found
          </h1>
          <p
            className="text-sm leading-relaxed mb-8 max-w-xs mx-auto"
            style={{ color: 'var(--muted-foreground)' }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Head back to browse spare parts.
          </p>

          <div className="flex justify-center">
            <Button
              asChild
              variant="outline"
              className="h-10 px-5 rounded-xl font-semibold text-sm gap-2 cursor-pointer"
            >
              <Link to="/">
                <ArrowLeft className="size-4" strokeWidth={1.5} />
                Go back home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
