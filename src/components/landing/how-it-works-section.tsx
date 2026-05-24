/* Hallmark · genre: modern-minimal · component: F4 step sequence
 * knobs: numbering=01/02/03, layout=horizontal-on-desktop, connector=none
 * design-system: design.md
 */
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Camera, CheckCircle2, MessageSquareQuote } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/motion'

const steps = [
  { icon: Camera, key: 'step1', num: '01' },
  { icon: MessageSquareQuote, key: 'step2', num: '02' },
  { icon: CheckCircle2, key: 'step3', num: '03' },
]

export function HowItWorksSection() {
  const { t: tBenefits } = useTranslation('home/benefits')

  return (
    <section id="how-it-works" className="w-full py-24 sm:py-32 bg-muted/30">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section head */}
        <motion.div
          className="mb-16 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground">
            {tBenefits('how_it_works.title')}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-[1.6]">
            {tBenefits('how_it_works.description')}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid gap-10 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {steps.map((step) => (
            <motion.div key={step.key} className="space-y-3" variants={fadeUp}>
              <p className="text-xs font-mono text-muted-foreground tracking-widest">
                {step.num}
              </p>
              <div className="flex items-center gap-2.5">
                <step.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <h3 className="text-base font-semibold text-foreground">
                  {tBenefits(`how_it_works.${step.key}.title`)}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tBenefits(`how_it_works.${step.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
