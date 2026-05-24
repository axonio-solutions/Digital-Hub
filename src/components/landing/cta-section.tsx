/* Hallmark · genre: modern-minimal · macrostructure: Workbench · Ft1 mast-headed footer
 * sellers: H2 split-diptych, marketplace: C3 typographic-link CTA
 * design-system: design.md
 */
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeUp, stagger } from '@/lib/motion'

export function CtaSection() {
  const { t: tMarketing } = useTranslation('home/marketing')

  return (
    <>
      {/* For Sellers — split diptych */}
      <section
        id="benefits"
        className="w-full py-24 sm:py-32 border-t border-border"
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
          {/* Text column */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold text-primary"
            >
              {tMarketing('sellers.badge')}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground"
            >
              {tMarketing('sellers.title')}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-muted-foreground leading-[1.6]"
            >
              {tMarketing('sellers.description')}
            </motion.p>
            <motion.ul variants={fadeUp} className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{tMarketing('sellers.feature1')}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{tMarketing('sellers.feature2')}</span>
              </li>
            </motion.ul>
            <motion.div variants={fadeUp}>
              <Link to="/login" className="inline-block">
                <Button
                  size="lg"
                  className="cursor-pointer h-11 px-6 text-[0.9375rem] font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] transition-all duration-150 rounded-full"
                >
                  {tMarketing('sellers.btn')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual — request list */}
          <motion.div
            className="order-first md:order-last"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground">
                  Seller Dashboard — Requests
                </p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  {
                    name: 'Clio 4 · Alternateur',
                    id: 'REQ-006',
                    quotes: 4,
                    urgent: true,
                  },
                  {
                    name: 'Golf 7 · Pare-choc',
                    id: 'REQ-001',
                    quotes: 2,
                    urgent: false,
                  },
                  {
                    name: 'Symbol · Plaquettes',
                    id: 'REQ-011',
                    quotes: 6,
                    urgent: false,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex cursor-pointer items-center justify-between px-4 py-3 rounded-xl bg-background border border-border/60 hover:border-border hover:shadow-sm transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {item.name}
                        </span>
                        {item.urgent && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.id} · {item.quotes} devis
                      </p>
                    </div>
                    <button className="cursor-pointer text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                      Répondre →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marketplace CTA */}
      <motion.section
        className="w-full py-24 sm:py-32 bg-muted/30 border-t border-border"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="max-w-3xl mx-auto px-6">
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold text-primary mb-5"
          >
            {tMarketing('marketplace.badge')}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-5"
          >
            {tMarketing('marketplace.title')}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-muted-foreground leading-[1.6] max-w-xl mb-8"
          >
            {tMarketing('marketplace.description')}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link to="/explore" search={{ q: '' }}>
              <Button
                size="lg"
                className="cursor-pointer h-11 px-6 text-[0.9375rem] font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] transition-all duration-150 rounded-full"
              >
                {tMarketing('marketplace.btn')}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer — Ft1 Mast-headed */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Wordmark + tagline */}
            <div className="space-y-1.5">
              <Link
                to="/"
                className="flex items-center gap-2 group"
                aria-label="MLILA Home"
              >
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-[10px] leading-none">
                    M
                  </span>
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-foreground">
                  MLILA
                </span>
              </Link>
              <p className="text-xs text-muted-foreground ps-8">
                {tMarketing('footer.tagline')}
              </p>
            </div>

            {/* Inline links */}
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Link
                to="/explore"
                search={{ q: '' }}
                className="hover:text-foreground transition-colors"
              >
                Explore
              </Link>
              <Link
                to="/pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <span className="w-px h-3.5 bg-border hidden sm:block" />
              <Link
                to="/login"
                className="hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                to={'/register' as any}
                className="hover:text-foreground transition-colors font-medium text-foreground"
              >
                Get Started
              </Link>
            </nav>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {tMarketing('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
