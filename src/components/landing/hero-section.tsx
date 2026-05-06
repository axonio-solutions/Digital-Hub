import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { t: tHero } = useTranslation('home/hero')
  const { t: tBenefits } = useTranslation('home/benefits')

  return (
    <section className="relative w-full min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Subtle warm glow top-right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {tHero('badge')}
            </span>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
              {tHero('title_main')}
              <br />
              <span className="text-primary">{tHero('title_highlight')}</span>
            </h1>

            {/* Description */}
            <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
              {tHero('description')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/dashboard/requests/new">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base font-bold bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all duration-150 rounded-xl shadow-lg shadow-primary/20"
                >
                  {tHero('buyer_btn')}
                  <ArrowRight className="ms-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base font-semibold border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-[0.98] transition-all duration-150 rounded-xl text-foreground"
                >
                  {tHero('seller_btn')}
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {tBenefits('trust.secure')}
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                {tBenefits('trust.quotes')}
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                {tBenefits('trust.delivery')}
              </div>
            </div>
          </div>

          {/* Right: Visual preview */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Ambient glow */}
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl pointer-events-none" />

              {/* Main card */}
              <div className="relative bg-card border border-border rounded-2xl shadow-xl shadow-foreground/5 p-6 space-y-5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">New Request</p>
                      <p className="text-xs text-muted-foreground">Golf 7 · Alternator</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    Active
                  </span>
                </div>

                {/* Quotes flowing in */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-black text-primary">A1</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">12,500 DA</p>
                      <p className="text-xs text-muted-foreground">Original · 6mo warranty</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-black text-muted-foreground">S3</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">9,800 DA</p>
                      <p className="text-xs text-muted-foreground">Used · 3mo warranty</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-black text-muted-foreground">R4</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">11,200 DA</p>
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">4 sellers</span>
                  competing for this request
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
