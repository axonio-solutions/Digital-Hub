import { Settings, Shield, User, Warehouse } from 'lucide-react'
import { GeneralInfoForm } from './general-info-form'
import { BuyerSettings } from './buyer-settings'
import { SellerSettings } from '@/features/seller'
import { AccountManagement } from './account-management'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useTranslation } from 'react-i18next'

export function ProfileTabs() {
  const { t } = useTranslation('dashboard/settings')
  const { data: user } = useAuth()
  const role = user?.role || 'buyer'

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('tabs.title')}</h2>
        <p className="text-muted-foreground">
          {t('tabs.desc')}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('tabs.general')}
          </TabsTrigger>

          {role === 'buyer' && (
            <TabsTrigger value="buyer" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              {t('tabs.delivery')}
            </TabsTrigger>
          )}

          {role === 'seller' && (
            <TabsTrigger value="seller" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t('tabs.store')}
            </TabsTrigger>
          )}

          <TabsTrigger
            value="management"
            className="flex items-center gap-2 text-destructive data-[state=active]:text-destructive"
          >
            <Settings className="h-4 w-4" />
            {t('tabs.manage')}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <GeneralInfoForm />
          </TabsContent>

          {role === 'buyer' && (
            <TabsContent value="buyer">
              <BuyerSettings />
            </TabsContent>
          )}

          {role === 'seller' && (
            <TabsContent value="seller">
              <SellerSettings />
            </TabsContent>
          )}

          <TabsContent value="management">
            <AccountManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
