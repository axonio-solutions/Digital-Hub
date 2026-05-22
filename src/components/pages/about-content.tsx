/* Hallmark · genre: modern-minimal · macrostructure: Long Document · S2 hanging section heads
 * design-system: design.md · designed-as-app
 */
'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Eye, Shield, Users, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

const ICONS: Record<string, typeof Shield> = { Shield, Zap, Eye, Users }

const reveal = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.36 },
}

export function AboutContent() {
  const { t } = useTranslation('home/about')

  const values = t('values', { returnObjects: true }) as Array<{
    title: string
    description: string
    icon: string
  }>
  const stats = t('stats', { returnObjects: true }) as Record<string, string>
  const points = t('mission.points', { returnObjects: true }) as Array<string>
  const paragraphs = t('story.paragraphs', {
    returnObjects: true,
  }) as Array<string>

  return (
    <main className="flex-1 w-full pt-[76px]">
      {/* Lede — Long Document opening */}
      <section className="w-full pt-16 sm:pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-[2.5rem] sm:text-[3.25rem] font-semibold tracking-[-0.025em] text-foreground leading-[1.08] overflow-wrap-anywhere">
            {t('hero.title')}
          </h1>
          <p className="mt-6 text-[1.125rem] text-muted-foreground leading-[1.7] max-w-2xl">
            {t('hero.subtitle')}
          </p>

          {/* Stats — inline horizontal strip, no card box */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-10 pt-8 border-t border-border">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key}>
                <p className="text-2xl font-semibold tabular-nums text-foreground tracking-[-0.02em]">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {key === 'buyers'
                    ? 'Active Buyers'
                    : key === 'sellers'
                      ? 'Verified Sellers'
                      : key === 'parts'
                        ? 'Parts Listed'
                        : 'Wilayas'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — prose with hanging head */}
      <motion.section
        {...reveal}
        className="w-full py-16 sm:py-20 border-t border-border"
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-6">
            {t('mission.title')}
          </h2>
          <p className="text-[1.0625rem] text-foreground leading-[1.7]">
            {t('mission.description')}
          </p>
          <ul className="mt-6 space-y-2.5">
            {points.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[0.9375rem] text-muted-foreground"
              >
                <span className="mt-2 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Values — 2-col text grid, no icon boxes */}
      <motion.section
        {...reveal}
        className="w-full py-16 sm:py-20 border-t border-border"
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-8">
            Our values
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map((val, i) => {
              const Icon = ICONS[val.icon] || Shield
              return (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {val.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {val.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Story — continuous prose */}
      <motion.section
        {...reveal}
        className="w-full py-16 sm:py-20 border-t border-border"
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-6">
            {t('story.title')}
          </h2>
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-[1.0625rem] text-muted-foreground leading-[1.7]"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA — typographic link in prose */}
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
