import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Package, Users } from 'lucide-react'
import { getLandingStatsServerFn } from '@/fn/landing'

const stats = [
  { key: 'activeSellers', label: 'Active Sellers', icon: Users, suffix: '+' },
  { key: 'partsSourced', label: 'Parts Sourced', icon: Package, suffix: '+' },
  {
    key: 'totalQuotes',
    label: 'Quotes Sent',
    icon: MessageSquare,
    suffix: '+',
  },
]

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}

export function FeaturesSection() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['landing-stats'],
    queryFn: () => getLandingStatsServerFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <section className="w-full py-20 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => {
            const value = statsData?.[stat.key as keyof typeof statsData] ?? 0
            return (
              <div key={stat.key} className="relative group">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-2">
                    {isLoading ? (
                      <span className="inline-block w-16 h-10 bg-muted animate-pulse rounded" />
                    ) : (
                      formatNumber(value)
                    )}
                    <span className="text-primary">{stat.suffix}</span>
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
