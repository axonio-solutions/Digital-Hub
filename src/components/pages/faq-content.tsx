'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FaqContent() {
  const { t } = useTranslation('home/faq')
  const [search, setSearch] = useState('')
  const [openCategory, setOpenCategory] = useState<string>('general')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const categories = t('categories', { returnObjects: true }) as Record<string, {
    title: string
    questions: Array<{ q: string; a: string }>
  }>

  const filtered = Object.entries(categories).map(([key, cat]) => ({
    key,
    ...cat,
    questions: cat.questions.filter(
      (q) => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase()),
    ),
  }))

  return (
    <main className="flex-1 w-full">
      {/* Hero */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-primary/[0.03] via-background to-background py-8 sm:py-14">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="relative max-w-md mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-11 rounded-xl bg-background border-border text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="w-full py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => { setOpenCategory(key); setOpenQuestion(null) }}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
                  openCategory === key
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="mt-6 space-y-2">
            {filtered.find((c) => c.key === openCategory)?.questions.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-12">No matching questions found.</p>
            )}
            {filtered
              .find((c) => c.key === openCategory)
              ?.questions.map((item, idx) => {
                const id = `${openCategory}-${idx}`
                const isOpen = openQuestion === id
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className={cn(
                      'rounded-2xl border transition-all',
                      isOpen ? 'border-primary/20 bg-primary/[0.02] shadow-sm' : 'border-border bg-card hover:border-border/80',
                    )}
                  >
                    <button
                      onClick={() => setOpenQuestion(isOpen ? null : id)}
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 text-left"
                    >
                      <span className="text-sm font-bold text-foreground flex-1 leading-snug">{item.q}</span>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
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
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 sm:px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 sm:py-28 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="size-6 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1] mb-3">
              {t('cta.title')}
            </h2>
            <p className="text-base text-muted-foreground mb-6">{t('cta.subtitle')}</p>
            <Link to="/contact">
              <Button className="h-13 px-8 text-base font-bold bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                {t('cta.button')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
