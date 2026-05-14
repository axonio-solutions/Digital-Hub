import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  const { t: tMarketing } = useTranslation('home/marketing')
  const { t: tHero } = useTranslation('home/hero')

  return (
    <>
      {/* For Sellers Section */}
      <section id="benefits" className="w-full py-24 bg-card overflow-hidden relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 md:gap-20 items-center relative z-10">
          {/* Text column */}
          <div className="space-y-7">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              {tMarketing('sellers.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              {tMarketing('sellers.title')}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {tMarketing('sellers.description')}
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-foreground font-medium">{tMarketing('sellers.feature1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-foreground font-medium">{tMarketing('sellers.feature2')}</span>
              </li>
            </ul>

            <Link to="/login" className="inline-block">
              <Button
                size="lg"
                className="h-13 px-8 text-base font-bold bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all duration-150 rounded-xl shadow-lg shadow-primary/20"
              >
                {tMarketing('sellers.btn')}
              </Button>
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="relative order-first md:order-last">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-2xl blur-2xl -z-10" />
            <div className="bg-background border border-border rounded-2xl shadow-lg overflow-hidden">
              <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-muted/50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="p-5 space-y-3">
                {[
                  { name: 'Clio 4 Alternator', id: 'REQ-006', quotes: 4, urgent: true },
                  { name: 'Golf 7 Bumper', id: 'REQ-001', quotes: 2 },
                  { name: 'Symbol Brake Pads', id: 'REQ-011', quotes: 6 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                        {item.urgent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.id} · {item.quotes} quotes
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:brightness-110 rounded-lg"
                    >
                      Quote
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Marketplace Section */}
      <section className="w-full py-24 bg-primary/[0.04] dark:bg-primary/[0.06] relative overflow-hidden border-t border-border">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/[0.03] -skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-14 md:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground" />
              </span>
              <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">
                {tMarketing('marketplace.badge')}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              {tMarketing('marketplace.title')}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              {tMarketing('marketplace.description')}
            </p>
            <Link to="/explore">
              <Button
                size="lg"
                className="h-13 px-8 text-base font-bold bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all duration-150 rounded-xl shadow-lg shadow-primary/20"
              >
                {tMarketing('marketplace.btn')}
                <ArrowRight className="ms-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Preview card */}
          <div className="flex-1 relative">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-bold text-foreground">
                    {tMarketing('marketplace.active_signals')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {tHero('live')}
                </span>
              </div>
              <div className="space-y-3">
                {[
                  'Alternator · Peugeot 208',
                  'Headlight · Dacia Logan',
                  'Fuel Pump · Hyundai i10',
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40"
                  >
                    <span className="text-sm font-medium text-foreground/80">{item}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {Math.floor(Math.random() * 5) + 1} quotes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-[11px] leading-none">M</span>
                </div>
                <span className="font-black text-lg tracking-tight text-foreground">MLILA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {tMarketing('sellers.description')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Explore Marketplace
                  </Link>
                </li>
                <li>
                  <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    For Sellers
                  </a>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Account</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/requests/new" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Post a Request
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {tMarketing('footer.copyright')}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {tMarketing('footer.tagline')}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
