import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqKeys = [
  { q: 'Is there a fee to post a request?', a: 'No. Posting a part request is completely free for all buyers.' },
  { q: 'How is the seller commission calculated?', a: 'Sellers pay a small percentage of the deal value upon successful sale. The exact rate is displayed during registration.' },
  { q: 'Are there any monthly subscription fees?', a: 'No. There are no monthly fees for buyers or sellers. You only pay when value is delivered.' },
  { q: 'How do I become a seller?', a: 'Register as a seller, complete your profile, and get verified by our team. Once approved, you can start browsing requests and submitting quotes.' },
  { q: 'Which regions does MLILA serve?', a: 'MLILA operates across all 48 wilayas of Algeria.' },
]

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="w-full py-20 md:py-28 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-[1.6]">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="space-y-3">
          {faqKeys.map((item, i) => {
            const isOpen = openIdx === i
            return (
              <div
                key={i}
                className={cn(
                  'rounded-xl border bg-card transition-all duration-200',
                  isOpen ? 'border-primary/20 shadow-sm' : 'border-border',
                )}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
