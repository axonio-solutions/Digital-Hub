import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AUTH_ROUTES } from '@/lib/routes'

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
      <section className="w-full pt-20 md:pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <p className="text-xs font-semibold text-primary mb-3">
            Pricing
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl leading-[1.6]">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="w-full py-16 md:py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  'rounded-xl border bg-card p-8 flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                  plan.popular
                    ? 'border-primary ring-1 ring-primary/20 shadow-sm'
                    : 'border-border',
                )}
              >
                {plan.popular && (
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full self-start mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
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
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check
                        className={cn(
                          'w-4 h-4 mt-0.5 shrink-0',
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
                      ? AUTH_ROUTES.REGISTER
                      : i === 1
                        ? `${AUTH_ROUTES.REGISTER}?seller=true`
                        : '/contact') as any
                  }
                >
                  <Button
                    className={cn(
                      'w-full h-11 rounded-lg text-sm font-semibold transition-all',
                      plan.popular
                        ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-background text-foreground border-2 border-border hover:border-primary/40 hover:bg-primary/5',
                    )}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <motion.section className="w-full py-16 md:py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-8">
            {t('faq.title')}
          </h2>
          <div className="space-y-6">
            {faqQuestions.map((item, i) => (
              <div key={i} className="space-y-2 pb-6 border-b border-border last:border-0">
                <h3 className="text-sm font-semibold text-foreground">
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

      {/* CTA */}
      <section className="w-full py-20 md:py-28 border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-4">
            {t('cta.title')}
          </h2>
          <Link to={AUTH_ROUTES.REGISTER as any}>
            <Button className="h-12 px-8 rounded-lg text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transition-all hover:-translate-y-0.5">
              {t('cta.button')}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
