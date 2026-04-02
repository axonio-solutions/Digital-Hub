import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Bell, Search } from 'lucide-react'
import { NotificationDropdown } from '@/features/notifications'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  useUnreadNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '@/features/notifications/hooks/use-notifications'
import { UserDropdown } from '@/features/dashboard/components/layout/user-dropdown'

export function SiteHeader() {
  const { data: user } = useAuth()
  const userId = user?.id || ''

  const { data: notifications = [] } = useUnreadNotifications(userId)
  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllRead } = useMarkAllNotificationsRead()

  const unreadCount = notifications.length

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-card px-4 lg:px-8 border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="flex w-full items-center gap-4">
        <SidebarTrigger className="-ms-1 size-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />

        <Separator
          orientation="vertical"
          className="mx-2 h-6 border-slate-200 dark:border-slate-800"
        />

        {/* Search Bar (Placeholder for high-fidelity) */}
        <div className="hidden md:flex relative max-w-sm w-full group">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search dashboard..."
            className="ps-10 h-10 w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-primary focus-visible:border-primary/50 text-sm italic"
          />
        </div>

        <div className="ms-auto flex items-center gap-3">
          <ThemeToggle />
          {/* Notifications */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={(id) => markAsRead(id)}
            onMarkAllRead={() => markAllRead(userId)}
            trigger={
              <button className="relative size-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group flex items-center justify-center">
                <Bell className="size-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 size-5 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-in fade-in zoom-in duration-300">
                    {unreadCount}
                  </span>
                )}
              </button>
            }
          />

          <Separator
            orientation="vertical"
            className="h-6 border-slate-200 dark:border-slate-800 mx-1 hidden sm:block"
          />

          <div className="flex items-center gap-3 ps-1">
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}

