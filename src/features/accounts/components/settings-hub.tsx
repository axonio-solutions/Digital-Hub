'use client'

import { useState } from 'react'
import {
  Bell,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GeneralInfoForm } from './general-info-form'
import { SellerSettings } from '@/features/seller'
import { AccountManagement } from './account-management'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { AvatarUpload } from '@/features/upload/components/avatar-upload'
import { SpecialtyManager } from '@/features/vendors/components/specialty-manager'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Sub-components


export function SettingsHub() {
  const { t } = useTranslation('dashboard/settings')
  const { data: user } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarItems = [
    { id: 'profile', label: t('sections.profile'), icon: User },
    { id: 'security', label: t('sections.security'), icon: Shield },
    { id: 'notifications', label: t('sections.notifications'), icon: Bell },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection user={user} />
      case 'security':
        return <SecuritySection />
      case 'notifications':
        return <NotificationsSection user={user} />
      default:
        return <ProfileSection user={user} />
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-10rem)] gap-8">
      {/* Mobile menu button */}
      <div className="lg:hidden flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-4 w-4 me-2 rtl:ms-2" />
          ) : (
            <Menu className="h-4 w-4 me-2 rtl:ms-2" />
          )}
          {t('menu')}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'lg:w-64 flex flex-col gap-2 shrink-0 transition-all duration-300',
          sidebarOpen ? 'block' : 'hidden lg:flex',
        )}
      >
        {sidebarItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setSidebarOpen(false)
              }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-sm',
                activeSection === item.id
                  ? 'bg-accent border border-accent-foreground/10 text-foreground scale-[1.02] shadow-sm'
                  : 'bg-card border hover:bg-muted/50 text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </aside>

      {/* Content Area */}
      <main className="flex-1 max-w-4xl">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function ProfileSection({ user }: { user: any }) {
  const { t } = useTranslation('dashboard/settings')
  const role = user?.role || 'buyer'

  return (
    <div className="space-y-10">
      <div className="px-1">
        <div className="flex items-center gap-3 mb-2">
          <User className="size-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Profile & Identity</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Manage your public avatar, professional bio, and account-level identification.
        </p>
      </div>

      <Card className="border shadow-sm overflow-hidden bg-card">
        <CardContent className="flex flex-col md:flex-row items-center gap-10 py-8 px-8">
          <AvatarUpload
            userId={user?.id || ''}
            currentImage={user?.image}
            size="lg"
          />
          <div className="flex-1 space-y-2 text-center md:text-left rtl:md:text-right">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {t('profile.identity_title')}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              {t('profile.identity_desc')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="px-1">
          <h3 className="text-lg font-bold tracking-tight mb-1">{t('profile.personal_title')}</h3>
          <p className="text-xs text-muted-foreground">{t('profile.personal_desc')}</p>
        </div>
        <GeneralInfoForm />
      </div>

      {role === 'seller' && (
        <div className="space-y-8 pt-8 border-t">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {t('profile.store_title')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('profile.store_desc')}
            </p>
          </div>
          <SellerSettings />
        </div>
      )}

      {role === 'seller' && (
        <div id="specialties" className="space-y-8 pt-8 border-t scroll-mt-20">
          <SpecialtyManager />
        </div>
      )}
    </div>
  )
}

function SecuritySection() {
  const { t } = useTranslation('dashboard/settings')
  return (
    <div className="space-y-8">
      <div className="px-1">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="size-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('security.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {t('security.desc')}
        </p>
      </div>
      <AccountManagement />
    </div>
  )
}

import { NotificationPreferences } from './notification-preferences'

function NotificationsSection({ user }: { user: any }) {
  const { t } = useTranslation('dashboard/settings')
  return (
    <div className="space-y-8">
      <div className="px-1">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="size-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('notifications.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {t('notifications.desc')}
        </p>
      </div>

      <NotificationPreferences user={user} />
    </div>
  )
}
