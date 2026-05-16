'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export function ContactContent() {
  const { t } = useTranslation('home/contact')
  const { toast } = useToast('home/contact')
  const [isSending, setIsSending] = useState(false)

  const subjects = t('subjects', { returnObjects: true }) as Array<{ value: string; label: string }>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    // Simulate send — replace with actual API call
    await new Promise((r) => setTimeout(r, 1200))
    setIsSending(false)
    toast.success('form.success')
  }

  return (
    <main className="flex-1 w-full">
      {/* Hero */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-primary/[0.03] via-background to-background py-8 sm:py-14">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              <Sparkles className="size-3.5" /> {t('hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="w-full -mt-6 relative z-10 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4">{t('info.title')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</p>
                      <a href={`mailto:${t('info.email')}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                        {t('info.email')}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
                      <p className="text-sm font-semibold text-foreground">{t('info.phone')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address</p>
                      <p className="text-sm font-semibold text-foreground">{t('info.address')}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground italic">{t('info.response')}</p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl bg-card border border-border">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-5">{t('form.title')}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2 sm:hidden" />
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('form.name')}
                    </Label>
                    <Input id="name" required placeholder={t('form.name_placeholder')} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('form.email')}
                    </Label>
                    <Input id="email" type="email" required placeholder={t('form.email_placeholder')} className="h-11 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="subject" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('form.subject')}
                    </Label>
                    <Select required>
                      <SelectTrigger id="subject" className="h-11 rounded-xl">
                        <SelectValue placeholder={t('form.subject_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="message" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('form.message')}
                    </Label>
                    <Textarea id="message" rows={4} required placeholder={t('form.message_placeholder')} className="rounded-xl resize-none" />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-12 mt-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                >
                  {isSending ? t('form.sending') : (
                    <>
                      {t('form.submit')}
                      <Send className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 sm:py-28 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1] mb-3">
              {t('cta.title')}
            </h2>
            <p className="text-base text-muted-foreground mb-6">{t('cta.subtitle')}</p>
            <Link to="/explore" search={{ q: '' }}>
              <Button variant="outline" className="h-13 px-8 text-base font-bold rounded-xl">
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
