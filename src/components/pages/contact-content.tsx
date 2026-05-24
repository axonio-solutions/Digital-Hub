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
import { PUBLIC_ROUTES } from '@/lib/routes'

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
      <section className="w-full pt-20 md:pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <p className="text-xs font-semibold text-primary mb-3">
            Contact
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl leading-[1.6]">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="w-full py-16 md:py-20 border-t border-border pb-24 sm:pb-32">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">
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
                  <div
                    key={label}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
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

              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('info.response')}
              </p>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-6">
                {t('form.title')}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-xl border border-border bg-card p-6 md:p-8"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs font-medium text-foreground"
                    >
                      {t('form.name')}
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder={t('form.name_placeholder')}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-foreground"
                    >
                      {t('form.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t('form.email_placeholder')}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="subject"
                    className="text-xs font-medium text-foreground"
                  >
                    {t('form.subject')}
                  </Label>
                  <Select required>
                    <SelectTrigger id="subject" className="h-10 rounded-lg">
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
                    className="text-xs font-medium text-foreground"
                  >
                    {t('form.message')}
                  </Label>
                  <Textarea
                    id="message"
                    rows={5}
                    required
                    placeholder={t('form.message_placeholder')}
                    className="rounded-lg resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="h-11 px-6 rounded-lg text-sm font-semibold bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    t('form.sending')
                  ) : (
                    <>
                      {t('form.submit')}
                      <Send className="ms-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 md:py-28 border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-4">
            {t('cta.title')}
          </h2>
          <Link to={PUBLIC_ROUTES.EXPLORE} search={{ q: '' }}>
            <Button className="h-12 px-8 rounded-lg text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transition-all hover:-translate-y-0.5">
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
