'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PricingContent() {
  const { t } = useTranslation('home/pricing')

  const plans = t('plans', { returnObjects: true }) as Array<{
    name: string; price: string; currency: string; period: string
    description: string; features: string[]; cta: string; popular: boolean
  }>
  const faqQuestions = t('faq.questions', { returnObjects: true }) as Array<{ q: string; a: string }>

  return (
    <main className="flex-1 w-full">
      {/* Hero */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-primary/[0.03] via-background to-background py-8 sm:py-14">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              <Sparkles className="size-3.5" /> {t('hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="w-full -mt-8 relative z-10 pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={cn(
                  'relative rounded-2xl border-2 p-6 sm:p-8 flex flex-col',
                  plan.popular
                    ? 'border-primary bg-primary/[0.02] shadow-xl shadow-primary/10'
                    : 'border-border bg-card',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-lg">
                      <Sparkles className="size-3" /> Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-black text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl sm:text-5xl font-black text-foreground">{plan.price}</span>
                  {plan.currency && <span className="text-sm font-bold text-muted-foreground ml-1">{plan.currency}</span>}
                  {plan.period && <span className="text-xs text-muted-foreground block mt-1">/{plan.period}</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check className={cn('size-4 mt-0.5 shrink-0', plan.popular ? 'text-primary' : 'text-muted-foreground')} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={(i === 0 ? '/register' : i === 1 ? '/register?seller=true' : '/contact') as any}>
                  <Button
                    className={cn(
                      'w-full h-12 rounded-xl font-bold text-sm',
                      plan.popular
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl'
                        : 'bg-muted text-foreground hover:bg-muted/80',
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-20 sm:py-28 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1] text-center mb-10">
            {t('faq.title')}
          </h2>
          <div className="space-y-3">
            {faqQuestions.map((item, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-card border border-border">
                <h3 className="text-sm font-bold text-foreground mb-1">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
              {t('cta.title')}
            </h2>
            <Link to={'/register' as any}>
              <Button className="h-13 px-8 text-base font-bold bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                {t('cta.button')}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
