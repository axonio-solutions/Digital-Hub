'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Eye, Users, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

const ICONS: Record<string, typeof Shield> = { Shield, Zap, Eye, Users }

export function AboutContent() {
  const { t } = useTranslation('home/about')

  const values = t('values', { returnObjects: true }) as Array<{ title: string; description: string; icon: string }>
  const stats = t('stats', { returnObjects: true }) as Record<string, string>
  const points = t('mission.points', { returnObjects: true }) as string[]
  const paragraphs = t('story.paragraphs', { returnObjects: true }) as string[]

  return (
    <main className="flex-1 w-full">
      {/* Hero */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-primary/[0.03] via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.06),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] max-w-3xl mx-auto">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="w-full -mt-6 sm:-mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums">{value}</p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                  {key === 'buyers' ? 'Active Buyers' : key === 'sellers' ? 'Verified Sellers' : key === 'parts' ? 'Parts Listed' : 'Wilayas'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="w-full py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1]">
                {t('mission.title')}
              </h2>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed">
                {t('mission.description')}
              </p>
              <ul className="mt-6 space-y-3">
                {points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-0.5 size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="size-1.5 rounded-full bg-primary" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              {values.map((val, i) => {
                const Icon = ICONS[val.icon] || Shield
                return (
                  <div key={i} className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight mb-1">{val.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{val.description}</p>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="w-full py-20 sm:py-28 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1] mb-8">
              {t('story.title')}
            </h2>
            <div className="space-y-5 text-left">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>
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
              <Button className="h-13 px-8 text-base font-bold bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
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
