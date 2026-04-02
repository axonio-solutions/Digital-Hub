'use client'

import { useState } from 'react'
import {
  Bell,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react'
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

const sidebarItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notification', icon: Bell },
]

export function SettingsHub() {
  const { data: user } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        <h2 className="text-2xl font-bold">Settings</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-4 w-4 me-2" />
          ) : (
            <Menu className="h-4 w-4 me-2" />
          )}
          Menu
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
                  ? 'bg-primary text-primary-foreground scale-[1.02] shadow-primary/20'
                  : 'bg-white border hover:bg-slate-50 text-muted-foreground hover:text-foreground',
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
  const role = user?.role || 'buyer'

  return (
    <div className="space-y-10">
      <Card className="border-primary/5 shadow-sm overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="flex flex-col md:flex-row items-center gap-10 py-8 px-8 bg-slate-50/30 dark:bg-slate-800/20">
          <AvatarUpload
            userId={user?.id || ''}
            currentImage={user?.image}
            size="lg"
          />
          <div className="flex-1 space-y-2 text-center md:text-start">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Profile Identity
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Your avatar is visible to other marketplace participants. Use a professional photo to build trust and increase proposal acceptance.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="px-1">
          <h3 className="text-lg font-bold tracking-tight mb-1">Personal Details</h3>
          <p className="text-xs text-muted-foreground">Manage your account information and contact details.</p>
        </div>
        <GeneralInfoForm />
      </div>

      {role === 'seller' && (
        <div className="space-y-8 pt-8 border-t">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Store Profile
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage your business identity as a seller.
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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Account Security
        </h1>
        <p className="text-muted-foreground">
          Protect your account with strong passwords and privacy controls.
        </p>
      </div>
      <AccountManagement />
    </div>
  )
}

import { NotificationPreferences } from './notification-preferences'

function NotificationsSection({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2">
          Notification Preferences
        </h1>
        <p className="text-muted-foreground font-medium text-sm">
          Optimize your experience by choosing where and how you receive marketplace signals.
        </p>
      </div>

      <NotificationPreferences user={user} />
    </div>
  )
}
