import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { fadeUp } from '@/lib/motion'

export function TestimonialsSection() {
  const { t } = useTranslation('home/testimonials')
  const items = t('items', { returnObjects: true }) as Array<{
    name: string
    role: string
    quote: string
  }>

  return (
    <section className="w-full py-20 md:py-28 bg-muted/30">
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

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-xl border border-border bg-card p-6 relative"
            >
              <Quote className="w-6 h-6 text-primary/20 absolute top-4 right-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">
                "{item.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
