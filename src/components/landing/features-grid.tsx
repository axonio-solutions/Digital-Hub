import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Brain,
  Coins,
  Languages,
  LayoutDashboard,
  MessageSquareQuote,
  Rss,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { fadeUp } from '@/lib/motion'

const features = [
  {
    icon: Rss,
    titleKey: 'feed_title',
    descKey: 'feed_desc',
  },
  {
    icon: Brain,
    titleKey: 'matching_title',
    descKey: 'matching_desc',
  },
  {
    icon: MessageSquareQuote,
    titleKey: 'quotes_title',
    descKey: 'quotes_desc',
  },
  {
    icon: ShieldCheck,
    titleKey: 'security_title',
    descKey: 'security_desc',
  },
  {
    icon: LayoutDashboard,
    titleKey: 'seller_dash_title',
    descKey: 'seller_dash_desc',
  },
  {
    icon: UserRound,
    titleKey: 'buyer_dash_title',
    descKey: 'buyer_dash_desc',
  },
  {
    icon: Languages,
    titleKey: 'lang_title',
    descKey: 'lang_desc',
  },
  {
    icon: Coins,
    titleKey: 'credits_title',
    descKey: 'credits_desc',
  },
]

export function FeaturesGridSection() {
  const { t } = useTranslation('home/features')

  return (
    <section className="w-full py-20 md:py-28">
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
            {t('section_badge')}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground"
          >
            {t('section_title')}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-[1.6]"
          >
            {t('section_desc')}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.titleKey}
                variants={fadeUp}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
