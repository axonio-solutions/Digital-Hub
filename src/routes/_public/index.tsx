import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { CtaSection } from '@/components/landing/cta-section'

export const Route = createFileRoute('/_public/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="flex-1 w-full relative">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </main>
  )
}
