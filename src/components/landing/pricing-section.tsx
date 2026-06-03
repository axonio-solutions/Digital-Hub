import { Await, Link, getRouteApi } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeUp } from '@/lib/motion'
import { AUTH_ROUTES } from '@/lib/routes'

const routeApi = getRouteApi('/_public/')

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-DZ').format(price) + ' DA'
}

const perks: Record<number, Array<string>> = {
  0: ['Post part requests', 'Compare seller quotes'],
  1: ['Everything in Starter', 'Priority listing', 'Seller dashboard access'],
  2: ['Everything in Pro', 'Dedicated support', 'Featured request badge'],
}

export function PricingSection() {
  const { creditPackages } = routeApi.useLoaderData()

  return (
    <section className="w-full py-20 md:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="text-center mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold text-primary mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground"
          >
            Choose your credit package
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-[1.6]"
          >
            Buy credits to post requests and unlock more features. The more you
            buy, the more you save.
          </motion.p>
        </motion.div>

        <Await
          promise={creditPackages}
          fallback={
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-8 space-y-4"
                >
                  <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-28 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          }
        >
          {(packages) => {
            const pkgs = packages ?? []
            const maxPkgs = pkgs.slice(0, 3)

            return (
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {maxPkgs.map((pkg, i) => {
                  const creditPrice = Math.round(pkg.price / pkg.credits)
                  const pkgPerks = perks[i] ?? [
                    'Access marketplace',
                    'Post requests',
                  ]

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={
                        'rounded-xl border bg-card p-8 flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ' +
                        (i === 1
                          ? 'border-primary ring-1 ring-primary/20 shadow-sm scale-[1.02] md:scale-105'
                          : 'border-border')
                      }
                    >
                      {i === 1 && (
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full self-start mb-4">
                          Most Popular
                        </span>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <Coins className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">
                          {pkg.name}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1">
                        {formatPrice(creditPrice)} / credit
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pkg.credits} credits total
                      </p>

                      <p className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
                        {formatPrice(pkg.price)}
                      </p>

                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}

                      <div className="border-t border-border pt-5 mb-6 space-y-2.5">
                        {pkgPerks.map((perk) => (
                          <div key={perk} className="flex items-center gap-2">
                            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm text-muted-foreground">
                              {perk}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <Button
                          asChild
                          className={
                            'w-full h-11 rounded-lg text-sm font-semibold transition-all ' +
                            (i === 1
                              ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5'
                              : 'bg-background text-foreground border-2 border-border hover:border-primary/40 hover:bg-primary/5')
                          }
                          variant={i === 1 ? 'default' : 'outline'}
                        >
                          <Link to={AUTH_ROUTES.REGISTER as any}>
                            Get Started
                            <ArrowRight className="ms-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )
          }}
        </Await>
      </div>
    </section>
  )
}
