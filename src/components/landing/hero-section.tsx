import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  )
}

function Badge({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function HeroSection() {
  const { t: tLayout } = useTranslation('home/layout')
  const { t: tHero } = useTranslation('home/hero')
  const { t: tBenefits } = useTranslation('home/benefits')

  return (
    <section className="relative w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 md:px-6 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none -z-10" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none -z-10" />

      <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-none transition-all px-4 py-1 text-sm font-semibold rounded-full">
        <SparkleIcon className="w-4 h-4 me-2" />
        {tHero('badge')}
      </Badge>

      <div className="max-w-[800px] space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
          {tHero('title_main')} <br className="hidden md:block" />
          <span className="text-primary">{tHero('title_highlight')}</span>
        </h1>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl font-medium leading-relaxed">
          {tHero('description')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-md mx-auto justify-center">
        <Link to="/dashboard/requests/new" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground w-full shadow-lg shadow-primary/30 transition-all font-semibold rounded-xl"
          >
            {tHero('buyer_btn')}
            <ArrowRight className="ms-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/login" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 w-full transition-all font-semibold rounded-xl text-foreground"
          >
            {tHero('seller_btn')}
          </Button>
        </Link>
      </div>

      <div className="mt-14 flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <div className="flex gap-2 items-center">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />{' '}
          {tBenefits('trust.secure')}
        </div>
        <div className="flex gap-2 items-center">
          <Zap className="w-5 h-5 text-amber-500" /> {tBenefits('trust.quotes')}
        </div>
        <div className="hidden sm:flex gap-2 items-center">
          <Truck className="w-5 h-5 text-primary" />{' '}
          {tBenefits('trust.delivery')}
        </div>
      </div>
    </section>
  )
}
