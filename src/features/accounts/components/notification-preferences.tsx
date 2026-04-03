'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Mail, Clock, ShieldCheck, Zap, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  getNotificationPreferencesServerFn, 
  updateNotificationPreferencesServerFn 
} from '@/fn/notifications'
import { flagAsSpamServerFn } from '@/fn/requests'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function NotificationPreferences({ user }: { user: any }) {
  const { t } = useTranslation('dashboard/settings')
  const queryClient = useQueryClient()
  const role = user?.role || 'buyer'

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => getNotificationPreferencesServerFn(),
  })

  const mutation = useMutation({
    mutationFn: (data: any) => updateNotificationPreferencesServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
      toast.success(t('messages.preferences_updated'))
    },
    onError: () => {
      toast.error(t('messages.update_pref_failed'))
    }
  })

  const handleUpdate = (data: any) => {
    mutation.mutate(data)
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      <p className="text-muted-foreground font-medium">{t('notifications_section.loading')}</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border shadow-sm bg-card rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {t('notifications_section.delivery_channels')}
          </CardTitle>
          <CardDescription>{t('notifications_section.delivery_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="group flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-semibold">{t('notifications_section.in_app')}</Label>
                <p className="text-xs text-muted-foreground">{t('notifications_section.in_app_desc')}</p>
              </div>
            </div>
            <Switch 
              checked={settings?.inAppEnabled} 
              onCheckedChange={(val) => handleUpdate({ inAppEnabled: val })}
              disabled={mutation.isPending}
            />
          </div>

          <div className="group flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-all">
            <div className="flex items-center gap-4 opacity-60">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  {t('notifications_section.email')}
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{t('notifications_section.coming_soon')}</span>
                </Label>
                <p className="text-xs text-muted-foreground">{t('notifications_section.email_desc')}</p>
              </div>
            </div>
            <Switch 
              checked={false}
              onCheckedChange={() => {}}
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>

      {role === 'seller' && (
        <Card className="border shadow-sm bg-card rounded-xl overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-6">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {t('notifications_section.seller_strategy')}
            </CardTitle>
            <CardDescription>{t('notifications_section.seller_strategy_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
             <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-primary mb-1 block">{t('notifications_section.frequency')}</Label>
                <p className="text-xs text-muted-foreground">{t('notifications_section.frequency_desc')}</p>
              </div>
              <RadioGroup 
                value={settings?.sellerAlertFrequency} 
                onValueChange={(val) => handleUpdate({ sellerAlertFrequency: val })}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                disabled={mutation.isPending}
              >
                <div className="relative">
                  <RadioGroupItem value="IMMEDIATE" id="freq-imm" className="peer sr-only" />
                  <Label htmlFor="freq-imm" className="flex flex-col p-4 rounded-xl border cursor-pointer border-transparent bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all hover:bg-muted/50">
                    <span className="font-semibold mb-1">{t('notifications_section.immediate')}</span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-relaxed">{t('notifications_section.immediate_desc')}</span>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem value="DAILY_DIGEST" id="freq-daily" className="peer sr-only" />
                  <Label htmlFor="freq-daily" className="flex flex-col p-4 rounded-xl border cursor-pointer border-transparent bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all hover:bg-muted/50">
                    <span className="font-semibold mb-1">{t('notifications_section.daily_digest')}</span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-relaxed">{t('notifications_section.daily_digest_desc')}</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-primary mb-1 block">{t('notifications_section.visibility')}</Label>
                <p className="text-xs text-muted-foreground font-medium">{t('notifications_section.visibility_desc')}</p>
              </div>
              <RadioGroup 
                value={settings?.sellerBrandScope}
                onValueChange={(val) => handleUpdate({ sellerBrandScope: val })}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                disabled={mutation.isPending}
              >
                <div className="relative">
                  <RadioGroupItem value="SPECIALTY_ONLY" id="scope-spec" className="peer sr-only" />
                  <Label htmlFor="scope-spec" className="flex flex-col p-4 rounded-xl border cursor-pointer border-transparent bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all hover:bg-muted/50">
                    <span className="font-semibold mb-1 flex items-center gap-2">
                       <ShieldCheck className="h-3 w-3" /> {t('notifications_section.my_specialties')}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-relaxed">{t('notifications_section.my_specialties_desc')}</span>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem value="ALL_BRANDS" id="scope-all" className="peer sr-only" />
                  <Label htmlFor="scope-all" className="flex flex-col p-4 rounded-xl border cursor-pointer border-transparent bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all hover:bg-muted/50">
                    <span className="font-semibold mb-1 flex items-center gap-2">
                       <Zap className="h-3 w-3" /> {t('notifications_section.global_access')}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-relaxed">{t('notifications_section.global_access_desc')}</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {role === 'admin' && (
        <Card className="border-red-200 shadow-sm bg-red-50/10 rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              {t('notifications_section.admin_sim')}
            </CardTitle>
            <CardDescription>{t('notifications_section.admin_sim_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-white">
              <div>
                <p className="text-sm font-semibold text-red-900">{t('notifications_section.spam_test')}</p>
                <p className="text-xs text-muted-foreground">{t('notifications_section.spam_test_desc')}</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  flagAsSpamServerFn({ data: 'TEST-123' })
                    .then(() => toast.success(t('messages.admin_alert_triggered')))
                    .catch(() => toast.error(t('messages.admin_alert_failed')))
                }}
              >
                {t('notifications_section.trigger_button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
