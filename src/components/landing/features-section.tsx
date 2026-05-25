import { useEffect, useRef, useState } from 'react'
import { Await, getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

const routeApi = getRouteApi('/_public/')

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString()
}

function AnimatedCounter({ value }: { value: number }) {
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
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(displayValue)}
      <span className="text-primary">+</span>
    </span>
  )
}

const statsConfig = [
  { key: 'activeSellers', labelKey: 'stats.sellers' },
  { key: 'activeBuyers', labelKey: 'stats.buyers' },
  { key: 'partsSourced', labelKey: 'stats.sourced' },
  { key: 'totalQuotes', labelKey: 'stats.quotes' },
] as const

export function StatsStrip() {
  const { landingStats } = routeApi.useLoaderData()
  const { t } = useTranslation('home/hero')

  return (
    <section className="w-full border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Await
          promise={landingStats}
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {statsConfig.map((stat) => (
                <div
                  key={stat.key}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                  <p className="text-xs text-muted-foreground">
                    {t(stat.labelKey)}
                  </p>
                </div>
              ))}
            </div>
          }
        >
          {(statsData) => (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {statsConfig.map((stat) => {
                const value =
                  statsData?.[stat.key] ?? 0
                return (
                  <div
                    key={stat.key}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                      <AnimatedCounter value={value} />
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      {t(stat.labelKey)}
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
