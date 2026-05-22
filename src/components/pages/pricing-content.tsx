/* Hallmark · genre: modern-minimal · macrostructure: Long Document · S3 sticky section head for plan comparison
 * design-system: design.md · designed-as-app
 */
'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const reveal = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.36 },
}

export function PricingContent() {
  const { t } = useTranslation('home/pricing')

  const plans = t('plans', { returnObjects: true }) as Array<{
    name: string
    price: string
    currency: string
    period: string
    description: string
    features: Array<string>
    cta: string
    popular: boolean
  }>
  const faqQuestions = t('faq.questions', { returnObjects: true }) as Array<{
    q: string
    a: string
  }>

  return (
    <main className="flex-1 w-full pt-[76px]">
      {/* Lede */}
      <section className="w-full pt-16 sm:pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-[2.5rem] sm:text-[3.25rem] font-semibold tracking-[-0.025em] text-foreground leading-[1.08] overflow-wrap-anywhere">
            {t('hero.title')}
          </h1>
          <p className="mt-5 text-[1.125rem] text-muted-foreground leading-[1.7] max-w-xl">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="w-full py-12 sm:py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                {...reveal}
                transition={{ duration: 0.36, delay: i * 0.06 }}
                className={cn(
                  'relative rounded-2xl border p-6 sm:p-8 flex flex-col',
                  plan.popular
                    ? 'border-primary/40 bg-primary/[0.02]'
                    : 'border-border bg-card',
                )}
              >
                {plan.popular && (
                  <p className="text-xs font-semibold text-primary mb-3">
                    Most popular
                  </p>
                )}
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-semibold tabular-nums tracking-[-0.02em] text-foreground">
                    {plan.price}
                  </span>
                  {plan.currency && (
                    <span className="text-sm text-muted-foreground ms-1">
                      {plan.currency}
                    </span>
                  )}
                  {plan.period && (
                    <span className="text-xs text-muted-foreground block mt-1">
                      /{plan.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm text-foreground/80"
                    >
                      <Check
                        className={cn(
                          'w-3.5 h-3.5 mt-0.5 flex-shrink-0',
                          plan.popular
                            ? 'text-primary'
                            : 'text-muted-foreground',
                        )}
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to={
                    (i === 0
                      ? '/register'
                      : i === 1
                        ? '/register?seller=true'
                        : '/contact') as any
                  }
                >
                  <Button
                    className={cn(
                      'w-full h-10 rounded-full font-semibold text-sm',
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'bg-muted text-foreground hover:bg-muted/80',
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="ms-2 w-3.5 h-3.5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — inline prose questions */}
      <motion.section
        {...reveal}
        className="w-full py-16 sm:py-20 border-t border-border"
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-8">
            {t('faq.title')}
          </h2>
          <div className="space-y-7">
            {faqQuestions.map((item, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-[0.9375rem] font-semibold text-foreground">
                  {item.q}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA — typographic link */}
      <section className="w-full py-16 sm:py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[1.125rem] text-foreground leading-relaxed">
            {t('cta.title')}{' '}
            <Link
              to={'/register' as any}
              className="inline-flex items-center gap-1 text-primary font-medium hover:opacity-80 transition-opacity underline underline-offset-2 decoration-primary/30"
            >
              {t('cta.button')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
