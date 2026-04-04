import { Bell } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotifications,
} from '@/features/notifications/hooks/use-notifications'
import { NotificationDropdown } from './notification-dropdown'

export function NotificationBell() {
  const { data: user } = useAuth()
  const userId = user?.id || ''

  const { data: notifications = [] } = useUnreadNotifications(userId)
  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllRead } = useMarkAllNotificationsRead()

  // We show the real count if it exists, otherwise use the dummy for demo purposes if it's 0
  // (Assuming the user wants to see '9' even if no notifications exist for now)
  const unreadCount = notifications.length > 0 ? notifications.length : 9

  return (
    <NotificationDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkRead={(id) => markAsRead(id)}
      onMarkAllRead={() => markAllRead(userId)}
      trigger={
        <button className="relative size-9 md:size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/30 transition-all group flex items-center justify-center shadow-sm">
          <Bell className="size-4.5 md:size-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-4 md:size-5 bg-red-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg animate-in fade-in zoom-in duration-300">
              {unreadCount}
            </span>
          )}
        </button>
      }
    />
  )
}
