import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  Search,
  MessageSquare,
  DollarSign,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeUp } from '@/lib/motion'
import { BUYER_ROUTES, AUTH_ROUTES } from '@/lib/routes'

export function HeroSection() {
  const { t: tHero } = useTranslation('home/hero')

  return (
    <section className="relative w-full min-h-dvh flex items-center pt-8 pb-12 lg:pb-16 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            className="text-center lg:text-left space-y-5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {/* Logo animation */}
            <motion.div
              variants={fadeUp}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative motion-safe:animate-float">
                <div
                  className="absolute inset-0 -m-5 rounded-full bg-primary/35 blur-3xl opacity-80"
                  aria-hidden="true"
                />
                <div className="relative rounded-[26%] p-1 bg-gradient-to-br from-primary/40 to-primary/10 ring-1 ring-primary/20">
                  <img
                    alt="MLILA"
                    width={60}
                    height={60}
                    className="h-14 w-14 rounded-[22%] shadow-xl"
                    src="/logo192.png"
                  />
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500" />
              </div>
            </motion.div>

            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              {tHero('badge')}
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground"
            >
              {tHero('title_main')}
              <br />
              <span className="relative inline-block bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                {tHero('title_highlight')}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2 text-primary/50"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 4 Q 50 0 100 4 T 200 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-muted-foreground mt-4 max-w-xl mx-auto lg:mx-0 leading-[1.6]"
            >
              {tHero('description')}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-6"
            >
              <Link to={BUYER_ROUTES.REQUESTS}>
                <Button
                  size="lg"
                  className="cursor-pointer h-11 px-6 text-[0.9375rem] font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transition-all hover:-translate-y-0.5 active:scale-[0.97] rounded-lg group"
                >
                  {tHero('buyer_btn')}
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to={AUTH_ROUTES.LOGIN}>
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer h-11 px-6 text-[0.9375rem] font-semibold border-2 border-border bg-background hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-0.5 active:scale-[0.97] rounded-lg group"
                >
                  {tHero('seller_btn')}
                </Button>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-5"
            >
              <div className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border text-xs font-medium shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 transition-transform group-hover:scale-110" />
                <span className="text-muted-foreground group-hover:text-foreground">
                  {tHero('trust_verified')}
                </span>
              </div>
              <div className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border text-xs font-medium shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                <Zap className="h-3.5 w-3.5 text-amber-500 transition-transform group-hover:scale-110" />
                <span className="text-muted-foreground group-hover:text-foreground">
                  {tHero('trust_quotes')}
                </span>
              </div>
              <div className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border text-xs font-medium shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                <Truck className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
                <span className="text-muted-foreground group-hover:text-foreground">
                  {tHero('trust_delivery')}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-muted/60 rounded-md px-3 py-1 text-[11px] text-muted-foreground text-center truncate">
                    mlila.dz/dashboard
                  </div>
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-5 space-y-4">
                {/* Mini stat pills */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary">
                    <Search className="w-3 h-3" />
                    12 requests
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-3 h-3" />5 quotes
                  </div>
                </div>

                {/* Request cards */}
                {[
                  {
                    part: 'Alternateur',
                    car: 'Golf 7 TDI 2016',
                    offers: 3,
                    time: '2h',
                    urgent: true,
                  },
                  {
                    part: 'Plaquettes de frein',
                    car: 'Clio 4 2019',
                    offers: 5,
                    time: '30min',
                    urgent: false,
                  },
                  {
                    part: 'Amortisseurs avant',
                    car: 'Megane 3 2014',
                    offers: 2,
                    time: '1j',
                    urgent: false,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.part}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + i * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.part}
                        </p>
                        {item.urgent && (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.car}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-foreground">
                        {item.offers} offres
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
