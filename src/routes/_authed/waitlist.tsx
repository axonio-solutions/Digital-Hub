import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, ShieldCheck, Mail, ArrowLeft, LogOut } from 'lucide-react'
import { authQueries } from '@/features/auth/queries/auth-queries'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/theme-toggle'
import { logoutFn } from '@/fn/auth'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authed/waitlist')({
  component: WaitlistPage,
})

function WaitlistPage() {
  const { t } = useTranslation('dashboard/waitlist')
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      window.location.href = '/'
    },
  })

  const handleRefresh = async () => {
    await queryClient.refetchQueries({
      queryKey: authQueries.user().queryKey,
    })
    await router.invalidate()
  }

  return (
    <div className="min-h-svh w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="gap-2 backdrop-blur-sm bg-card/10 hover:bg-destructive/10 hover:text-destructive border-border"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t('nav.logout')}</span>
        </Button>
      </div>
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="max-w-xl w-full border border-border shadow-2xl bg-card/90 backdrop-blur-sm relative z-10 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x w-full" />
        
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -bottom-2 -end-2 bg-green-500 rounded-full p-2 border-4 border-card shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                {t('hero.title')}
              </h1>
              <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                {t('hero.desc_prefix')} <span className="text-primary font-bold">MLILA</span>. {t('hero.desc_main')} <span className="font-semibold text-foreground">{t('hero.moderation')}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-4">
              <StepInfo 
                icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                title={t('steps.reviewing.title')}
                desc={t('steps.reviewing.desc')}
                active
              />
              <StepInfo 
                icon={<Mail className="h-5 w-5 text-muted-foreground" />}
                title={t('steps.notification.title')}
                desc={t('steps.notification.desc')}
              />
              <StepInfo 
                icon={<ArrowLeft className="h-5 w-5 text-muted-foreground" />}
                title={t('steps.access.title')}
                desc={t('steps.access.desc')}
              />
            </div>

            <div className="w-full h-px bg-border" />

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-1">
              <Button 
                onClick={handleRefresh}
                className="bg-primary hover:bg-primary/90 h-11 px-8 text-sm font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                {t('buttons.check_status')}
              </Button>
              <Button 
                variant="outline"
                asChild
                className="h-11 px-8 border-2 font-bold hover:bg-accent"
              >
                <a href="mailto:support@mlila.dz">{t('buttons.contact_support')}</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StepInfo({ icon, title, desc, active = false }: any) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border-2 transition-all",
      active 
        ? "border-primary/20 bg-primary/5 shadow-sm" 
        : "border-transparent bg-muted/40"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center mb-3 mx-auto",
        active ? "bg-card shadow-inner" : "bg-card/50"
      )}>
        {icon}
      </div>
      <h3 className={cn(
        "text-sm font-bold mb-1",
        active ? "text-foreground" : "text-muted-foreground"
      )}>{title}</h3>
      <p className="text-[11px] text-muted-foreground/80 leading-tight">{desc}</p>
    </div>
  )
}
