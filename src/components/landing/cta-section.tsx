import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  BarChart3,
  PackageCheck,
  Settings,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

function Badge({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function CtaSection() {
  const { t: tMarketing } = useTranslation('home/marketing')
  const { t: tHero } = useTranslation('home/hero')

  return (
    <>
      {/* For Sellers Section */}
      <section
        id="benefits"
        className="w-full py-24 bg-card text-foreground overflow-hidden relative border-y border-border"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1 font-medium border-primary/30">
              {tMarketing('sellers.badge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {tMarketing('sellers.title')}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {tMarketing('sellers.description')}
            </p>

            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-lg text-foreground">
                <div className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20 text-emerald-500">
                  <PackageCheck className="w-5 h-5" />
                </div>
                {tMarketing('sellers.feature1')}
              </li>
              <li className="flex items-center gap-4 text-lg text-foreground">
                <div className="bg-primary/10 p-2 rounded-full border border-primary/20 text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
                {tMarketing('sellers.feature2')}
              </li>
            </ul>

            <Link to="/login" className="inline-block mt-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-14 px-8 rounded-xl shadow-xl shadow-primary/20"
              >
                {tMarketing('sellers.btn')}
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-2xl blur-3xl -z-10" />
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="h-12 border-b border-border flex items-center px-4 gap-2 bg-muted/50">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    'Clio 4 Alternator · REQ-006 · 4 Competing Quotes',
                    'Golf 7 Bumper · REQ-001',
                  ].map((label, i) => (
                    <div
                      key={i}
                      className="bg-card p-4 rounded-xl border border-border flex justify-between items-center"
                    >
                      <div>
                        <div className="text-foreground font-semibold mb-1">
                          {label.split('·')[0]}
                        </div>
                        <div className="text-muted-foreground text-xs font-mono">
                          {label.split('·').slice(1).join('·')}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-xs text-primary-foreground"
                      >
                        View & Quote
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Marketplace CTA */}
      <section className="w-full py-24 bg-accent relative overflow-hidden">
        <div className="absolute top-0 end-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <Badge className="bg-primary text-primary-foreground border-none py-1 px-3 rounded-full font-bold uppercase tracking-wider text-[10px]">
              {tMarketing('marketplace.badge')}
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {tMarketing('marketplace.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              {tMarketing('marketplace.description')}
            </p>
            <Link to="/explore">
              <Button
                size="lg"
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xl flex items-center"
              >
                {tMarketing('marketplace.btn')}
                <ArrowRight className="ms-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex-1 relative">
            <div className="bg-card rounded-3xl shadow-2xl border border-border p-8 transform rotate-2 hover:rotate-0 transition-all duration-500 scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="font-bold text-foreground">
                  {tMarketing('marketplace.active_signals')}
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-muted/30 rounded-xl border border-border/50 flex justify-between items-center opacity-70"
                  >
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                    <div className="h-6 bg-primary/10 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-6 -left-6 bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl font-black text-xl z-20">
              {tHero('live')}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              MLILA
            </span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            © 2026 MLILA. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
