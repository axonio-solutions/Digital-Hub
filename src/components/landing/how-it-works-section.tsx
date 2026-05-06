import { useTranslation } from 'react-i18next'
import { Camera, CheckCircle2, MessageSquareQuote } from 'lucide-react'

const steps = [
  { icon: Camera, key: 'step1' },
  { icon: MessageSquareQuote, key: 'step2' },
  { icon: CheckCircle2, key: 'step3' },
]

export function HowItWorksSection() {
  const { t: tBenefits } = useTranslation('home/benefits')

  return (
    <section id="how-it-works" className="w-full py-24 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {tBenefits('how_it_works.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {tBenefits('how_it_works.description')}
          </p>
        </div>

        {/* Horizontal flow on desktop, stacked on mobile */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[72px] left-[16%] right-[16%] h-px bg-border" />

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.key} className="relative flex flex-col items-center text-center group">
                {/* Step number circle */}
                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-lg shadow-primary/20 mb-6 transition-transform duration-200 group-hover:scale-105">
                  {index + 1}
                </div>

                {/* Connector dots on the line — desktop only */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[28px] left-[calc(66%_-_4px)] w-2 h-2 rounded-full bg-primary/40" />
                )}

                {/* Content card */}
                <div className="bg-card border border-border/60 rounded-2xl p-6 w-full hover:border-primary/30 hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 mx-auto">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {tBenefits(`how_it_works.${step.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tBenefits(`how_it_works.${step.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
