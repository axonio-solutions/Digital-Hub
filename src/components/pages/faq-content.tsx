/* Hallmark · genre: modern-minimal · macrostructure: Long Document · S4 inline-no-break section heads
 * FAQ accordion: clean border-b dividers, no rounded card boxes
 * design-system: design.md · designed-as-app
 */
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FaqContent() {
  const { t } = useTranslation('home/faq')
  const [search, setSearch] = useState('')
  const [openCategory, setOpenCategory] = useState<string>('general')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const categories = t('categories', { returnObjects: true }) as Record<
    string,
    {
      title: string
      questions: Array<{ q: string; a: string }>
    }
  >

  const filtered = Object.entries(categories).map(([key, cat]) => ({
    key,
    ...cat,
    questions: cat.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(search.toLowerCase()) ||
        q.a.toLowerCase().includes(search.toLowerCase()),
    ),
  }))

  return (
    <main className="flex-1 w-full pt-[76px]">
      {/* Lede */}
      <section className="w-full pt-16 sm:pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-[2.5rem] sm:text-[3.25rem] font-semibold tracking-[-0.025em] text-foreground leading-[1.08] overflow-wrap-anywhere">
            {t('hero.title')}
          </h1>
          <p className="mt-5 text-[1.125rem] text-muted-foreground leading-[1.7] max-w-xl">
            {t('hero.subtitle')}
          </p>

          {/* Search — functional, clean */}
          <div className="relative mt-8 max-w-sm">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 ps-10 rounded-full bg-muted/40 border-border text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="w-full py-8 sm:py-12 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          {/* Category tabs — minimal pill row */}
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-none">
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => {
                  setOpenCategory(key)
                  setOpenQuestion(null)
                }}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap',
                  openCategory === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Questions — clean border-b accordion */}
          <div className="mt-6">
            {filtered.find((c) => c.key === openCategory)?.questions.length ===
              0 && (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No matching questions found.
              </p>
            )}
            {filtered
              .find((c) => c.key === openCategory)
              ?.questions.map((item, idx) => {
                const id = `${openCategory}-${idx}`
                const isOpen = openQuestion === id
                return (
                  <div
                    key={id}
                    className="border-b border-border last:border-b-0"
                  >
                    <button
                      onClick={() => setOpenQuestion(isOpen ? null : id)}
                      className="w-full flex items-center justify-between gap-4 py-4 text-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
                    >
                      <span className="text-[0.9375rem] font-medium text-foreground leading-snug">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
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

      {/* CTA — typographic link */}
      <section className="w-full py-16 sm:py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[1.125rem] text-foreground leading-relaxed">
            {t('cta.title')}{' '}
            <Link
              to="/contact"
              className="inline-flex items-center gap-1 text-primary font-medium hover:opacity-80 transition-opacity underline underline-offset-2 decoration-primary/30"
            >
              {t('cta.button')}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
