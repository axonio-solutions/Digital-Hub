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

  const unreadCount = notifications.length

  return (
    <NotificationDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkRead={(id) => markAsRead(id)}
      onMarkAllRead={() => userId && markAllRead(userId)}
      trigger={
        <button className="relative size-9 rounded-lg bg-background border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group flex items-center justify-center">
          <Bell className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none border-2 border-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      }
    />
  )
}
