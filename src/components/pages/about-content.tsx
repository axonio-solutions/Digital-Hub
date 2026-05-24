import { motion } from 'framer-motion'
import { ArrowRight, Eye, Shield, Users, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

const ICONS: Record<string, typeof Shield> = { Shield, Zap, Eye, Users }

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
      {/* Lede */}
      <section className="w-full pt-20 md:pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <p className="text-xs font-semibold text-primary mb-3">
            About us
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-[1.6]">
            {t('hero.subtitle')}
          </p>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-border">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key}>
                <p className="text-3xl font-extrabold tracking-tight text-foreground">
                  {value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
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

      {/* Mission */}
      <motion.section className="w-full py-16 md:py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-xs font-semibold text-primary mb-4 uppercase tracking-wider">
            {t('mission.title')}
          </h2>
          <p className="text-base md:text-lg text-foreground leading-[1.6]">
            {t('mission.description')}
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Values */}
      <motion.section className="w-full py-16 md:py-20 border-t border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-8 text-center">
            Our values
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((val, i) => {
              const Icon = ICONS[val.icon] || Shield
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-xl border border-border bg-card p-6 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {val.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Story */}
      <motion.section className="w-full py-16 md:py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-6">
            {t('story.title')}
          </h2>
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-base md:text-lg text-muted-foreground leading-[1.6]"
              >
                {p}
              </p>
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
          <Link to={'/register' as any}>
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
