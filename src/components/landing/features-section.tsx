/* Hallmark · genre: modern-minimal · component: T4 numbered stat strip
 * knobs: 3-up, number=tabular display, qualifier=under
 * design-system: design.md
 */
import { useEffect, useRef, useState } from 'react'
import { Await, getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/_public/')

const stats = [
  { key: 'activeSellers', label: 'Active Sellers', suffix: '+' },
  { key: 'partsSourced', label: 'Parts Sourced', suffix: '+' },
  { key: 'totalQuotes', label: 'Quotes Sent', suffix: '+' },
]

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || triggered.current || value === 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggered.current = true
          const duration = 1000
          const start = performance.now()

          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayValue(Math.floor(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
            else setDisplayValue(value)
          }

          requestAnimationFrame(animate)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(displayValue)}
      <span className="text-primary">{suffix}</span>
    </span>
  )
}

export function StatsStrip() {
  const { landingStats } = routeApi.useLoaderData()

  return (
    <section className="w-full border-y border-border">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Await
          promise={landingStats}
          fallback={
            <div className="grid grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="flex flex-col items-center gap-2 px-6 [&:not(:last-child)]:border-e border-border"
                >
                  <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          }
        >
          {(statsData) => (
            <div className="grid grid-cols-3">
              {stats.map((stat) => {
                const value =
                  statsData?.[stat.key as keyof typeof statsData] ?? 0
                return (
                  <div
                    key={stat.key}
                    className="flex flex-col items-center gap-1.5 px-6 [&:not(:last-child)]:border-e border-border"
                  >
                    <p className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">
                      <AnimatedCounter value={value} suffix={stat.suffix} />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </Await>
      </div>
    </section>
  )
}
