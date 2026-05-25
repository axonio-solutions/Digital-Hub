import { createFileRoute, defer } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsStrip } from '@/components/landing/features-section'
import { FeaturesGridSection } from '@/components/landing/features-grid'
import { PricingSection } from '@/components/landing/pricing-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FaqSection } from '@/components/landing/faq-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { CtaSection } from '@/components/landing/cta-section'

export const Route = createFileRoute('/_public/')({
  loader: async () => {
    const [{ getLandingStatsServerFn }, { getCreditPackagesServerFn }] =
      await Promise.all([import('@/fn/landing'), import('@/fn/landing')])
    const statsPromise = getLandingStatsServerFn()
    const packagesPromise = getCreditPackagesServerFn()
    return {
      landingStats: defer(statsPromise),
      creditPackages: defer(packagesPromise),
    }
  },
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="flex-1 w-full">
      <HeroSection />
      <StatsStrip />
      <FeaturesGridSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </main>
  )
}
