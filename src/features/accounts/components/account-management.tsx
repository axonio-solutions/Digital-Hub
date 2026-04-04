import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertTriangle,
  EyeOff,
  Loader2,
  Lock,
  Trash2,
} from 'lucide-react'
import { deactivateAccountServerFn, deleteAccountServerFn } from '@/fn/users'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AccountManagement() {
  const { t } = useTranslation('dashboard/settings')
  const { data: user } = useAuth()

  const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: async (userId: string) => {
      return await (deactivateAccountServerFn as any)({ data: { userId } })
    },
    onSuccess: () => {
      toast.success(t('messages.account_deactivated'), {
        description: t('messages.account_deactivated_desc'),
      })
      window.location.href = '/'
    },
    onError: () => {
      toast.error(t('messages.deactivation_failed'))
    },
  })

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: async (userId: string) => {
      return await (deleteAccountServerFn as any)({ data: { userId } })
    },
    onSuccess: () => {
      toast.success(t('messages.account_deleted'), {
        description: t('messages.account_deleted_desc'),
      })
      window.location.href = '/'
    },
    onError: () => {
      toast.error(t('messages.deletion_failed'))
    },
  })

  const handleDeactivate = () => {
    if (!user?.id) return
    if (confirm(t('security_section.prompts.deactivate_confirm'))) {
      deactivate(user.id)
    }
  }

  const handleDelete = () => {
    if (!user?.id) return
    const check = prompt(t('security_section.prompts.delete_confirm'))
    if (check === 'DELETE') {
      remove(user.id)
    }
  }

  return (
    <div className="space-y-10">
      {/* Password Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="size-5 text-primary" />
          <h2 className="text-xl font-bold">{t('security_section.password')}</h2>
        </div>
        <Card className="border shadow-sm bg-card">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">{t('security_section.current_password')}</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">{t('security_section.new_password')}</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">{t('security_section.confirm_password')}</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" className="font-bold">
                {t('security_section.update_button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Destructive Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          <h2 className="text-xl font-bold text-destructive">{t('security_section.danger_zone')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-orange-500/20 bg-orange-500/5 shadow-none dark:bg-orange-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-orange-900 dark:text-orange-400 flex items-center gap-2">
                <EyeOff className="size-4" /> {t('security_section.deactivation')}
              </CardTitle>
              <CardDescription className="text-xs text-orange-700/70 dark:text-orange-400/70">
                {t('security_section.deactivation_desc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 font-bold"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  t('security_section.deactivation_button')
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5 shadow-none dark:bg-red-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-red-900 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="size-4" /> {t('security_section.deletion')}
              </CardTitle>
              <CardDescription className="text-xs text-red-700/70 dark:text-red-400/70">
                {t('security_section.deletion_desc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant="destructive"
                size="sm"
                className="w-full font-bold shadow-lg shadow-red-500/20"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  t('security_section.deletion_button')
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
