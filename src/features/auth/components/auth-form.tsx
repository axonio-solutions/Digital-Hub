import { useTranslation } from 'react-i18next'
import { LoginForm } from './login-form'
import { LanguageToggle } from '@/components/language-toggle'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * Axis Layer 1: Unified Auth Container
 * This component orchestrates the high-level UI for Auth
 */

export function AuthForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth/login')

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-primary/10 shadow-lg relative overflow-hidden">
        <div className="absolute top-4 right-4 z-20 rtl:right-auto rtl:left-4">
          <LanguageToggle />
        </div>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>
            {t('login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-4">
            <LoginForm />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {t('login.footer_text')}
      </p>
    </div>
  )
}
