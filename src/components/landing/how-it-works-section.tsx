import { useTranslation } from 'react-i18next'
import { Camera, CheckCircle2, MessageSquareQuote } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    key: 'step1',
  },
  {
    icon: MessageSquareQuote,
    key: 'step2',
  },
  {
    icon: CheckCircle2,
    key: 'step3',
  },
]

export function HowItWorksSection() {
  const { t: tBenefits } = useTranslation('home/benefits')

  return (
    <section
      id="how-it-works"
      className="w-full py-20 bg-card border-y border-border relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {tBenefits('how_it_works.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {tBenefits('how_it_works.description')}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.key} className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl" />
              <div className="relative h-full bg-background border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl mb-6 shadow-md shadow-primary/20">
                  {index + 1}
                </div>
                <div className="mb-4">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {tBenefits(`how_it_works.${step.key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tBenefits(`how_it_works.${step.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
