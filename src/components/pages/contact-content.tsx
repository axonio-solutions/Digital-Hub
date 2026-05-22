/* Hallmark · genre: modern-minimal · macrostructure: Long Document · S2 hanging section head
 * contact: left info + right form, no slide-in animations on page load
 * design-system: design.md · designed-as-app
 */
'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
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

  const subjects = t('subjects', { returnObjects: true }) as Array<{
    value: string
    label: string
  }>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsSending(false)
    toast.success('form.success')
  }

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
        </div>
      </section>

      {/* Content — info left, form right */}
      <section className="w-full py-12 border-t border-border pb-24 sm:pb-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-12">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                {t('info.title')}
              </h2>

              <div className="space-y-5">
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: t('info.email'),
                    href: `mailto:${t('info.email')}`,
                  },
                  {
                    icon: Phone,
                    label: 'Phone',
                    value: t('info.phone'),
                    href: null,
                  },
                  {
                    icon: MapPin,
                    label: 'Address',
                    value: t('info.address'),
                    href: null,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-foreground">
                          {value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('info.response')}
              </p>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-6">
                {t('form.title')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {t('form.name')}
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder={t('form.name_placeholder')}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {t('form.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t('form.email_placeholder')}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="subject"
                    className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {t('form.subject')}
                  </Label>
                  <Select required>
                    <SelectTrigger id="subject" className="h-10 rounded-xl">
                      <SelectValue
                        placeholder={t('form.subject_placeholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="message"
                    className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {t('form.message')}
                  </Label>
                  <Textarea
                    id="message"
                    rows={5}
                    required
                    placeholder={t('form.message_placeholder')}
                    className="rounded-xl resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="h-10 px-6 rounded-full font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] transition-all duration-150 disabled:opacity-50"
                >
                  {isSending ? (
                    t('form.sending')
                  ) : (
                    <>
                      {t('form.submit')}
                      <Send className="ms-2 w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — typographic link */}
      <section className="w-full py-16 sm:py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[1.125rem] text-foreground leading-relaxed">
            {t('cta.title')}{' '}
            <Link
              to="/explore"
              search={{ q: '' }}
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
