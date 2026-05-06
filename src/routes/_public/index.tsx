import { createFileRoute, defer } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsStrip } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { CtaSection } from '@/components/landing/cta-section'

export const Route = createFileRoute('/_public/')({
  loader: async () => {
    const { getLandingStatsServerFn } = await import('@/fn/landing')
    const statsPromise = getLandingStatsServerFn()
    return {
      landingStats: defer(statsPromise),
    }
  },
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="flex-1 w-full">
      <HeroSection />
      <StatsStrip />
      <HowItWorksSection />
      <CtaSection />
    </main>
  )
}
