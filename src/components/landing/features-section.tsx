import { useRef, useState, useEffect } from 'react'
import { Await, getRouteApi } from '@tanstack/react-router'
import { MessageSquare, Package, Users } from 'lucide-react'

const routeApi = getRouteApi('/_public/')

const stats = [
  { key: 'activeSellers', label: 'Active Sellers', icon: Users, suffix: '+' },
  { key: 'partsSourced', label: 'Parts Sourced', icon: Package, suffix: '+' },
  { key: 'totalQuotes', label: 'Quotes Sent', icon: MessageSquare, suffix: '+' },
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
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {formatNumber(displayValue)}
      <span className="text-primary">{suffix}</span>
    </span>
  )
}

export function StatsStrip() {
  const { landingStats } = routeApi.useLoaderData()

  return (
    <section className="w-full border-y border-border bg-muted/30">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Await
          promise={landingStats}
          fallback={
            <div className="grid grid-cols-3 divide-x divide-border">
              {stats.map((stat) => (
                <div key={stat.key} className="flex flex-col items-center justify-center gap-2 px-6">
                  <stat.icon className="w-5 h-5 text-primary/60" />
                  <div className="text-3xl md:text-4xl font-black text-foreground tracking-tight tabular-nums">
                    <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          {(statsData) => (
            <div className="grid grid-cols-3 divide-x divide-border">
              {stats.map((stat) => {
                const value = statsData?.[stat.key as keyof typeof statsData] ?? 0
                return (
                  <div
                    key={stat.key}
                    className="flex flex-col items-center justify-center gap-2 px-6"
                  >
                    <stat.icon className="w-5 h-5 text-primary/60" />
                    <div className="text-3xl md:text-4xl font-black text-foreground tracking-tight tabular-nums">
                      <AnimatedCounter value={value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
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
