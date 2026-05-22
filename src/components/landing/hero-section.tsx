/* Hallmark · genre: modern-minimal · macrostructure: Workbench · H2 split-diptych knobs: ratio=6/6, right=proof-column, divider=negative-space
 * design-system: design.md · designed-as-app · nav-clearance: pt-[76px]
 */
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { t: tHero } = useTranslation('home/hero')
  const { t: tBenefits } = useTranslation('home/benefits')

  return (
    <section className="relative w-full min-h-[90vh] flex items-center pt-[76px] pb-16 lg:pb-24 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div className="space-y-7">
            {/* Eyebrow — plain text, no pulsing dot */}
            <p className="text-sm font-medium text-primary tracking-wide">
              {tHero('badge')}
            </p>

            {/* Headline */}
            <h1 className="text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] font-semibold tracking-[-0.025em] text-foreground leading-[1.08] overflow-wrap-anywhere">
              {tHero('title_main')}
              <br />
              <span className="text-primary">{tHero('title_highlight')}</span>
            </h1>

            {/* Description */}
            <p className="max-w-lg text-[1.0625rem] text-muted-foreground leading-[1.65]">
              {tHero('description')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to={'/dashboard/requests/new' as any}>
                <Button
                  size="lg"
                  className="h-11 px-6 text-[0.9375rem] font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] transition-all duration-150 rounded-full"
                >
                  {tHero('buyer_btn')}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6 text-[0.9375rem] font-semibold border border-border hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-[0.97] transition-all duration-150 rounded-full text-foreground"
                >
                  {tHero('seller_btn')}
                </Button>
              </Link>
            </div>

            {/* Trust signals — inline, no icon boxes */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {tBenefits('trust.secure')}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                {tBenefits('trust.quotes')}
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {tBenefits('trust.delivery')}
              </span>
            </div>
          </div>

          {/* Right: Quote comparison — honest demo, not live data */}
          <div className="hidden lg:block">
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Golf 7 · Alternateur
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tHero('badge')}
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  3 devis
                </span>
              </div>

              {/* Quote rows */}
              <div className="space-y-3 mt-4">
                {[
                  {
                    code: 'A1',
                    price: '12 500 DA',
                    note: 'Original · 6 mois garantie',
                    accent: true,
                  },
                  {
                    code: 'S3',
                    price: '9 800 DA',
                    note: 'Occasion · 3 mois garantie',
                    accent: false,
                  },
                  {
                    code: 'R4',
                    price: '11 200 DA',
                    note: 'Reconditionné',
                    accent: false,
                  },
                ].map((q) => (
                  <div
                    key={q.code}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                      q.accent
                        ? 'bg-primary/5 border border-primary/15'
                        : 'bg-muted/40 border border-border/50'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-muted-foreground tabular-nums w-6 flex-shrink-0">
                      {q.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold ${q.accent ? 'text-primary' : 'text-foreground'}`}
                      >
                        {q.price}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {q.note}
                      </p>
                    </div>
                    {q.accent && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
