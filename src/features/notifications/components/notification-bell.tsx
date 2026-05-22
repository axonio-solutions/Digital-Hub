import { useState } from 'react'
import { Bell } from 'lucide-react'
import { NotificationDropdown } from './notification-dropdown'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotifications,
} from '@/features/notifications/hooks/use-notifications'

export function NotificationBell() {
  const { data: user } = useAuth()
  const userId = user?.id || ''
  const [limit, setLimit] = useState(10)

  const { data, isLoading, isError } = useUnreadNotifications(userId, limit)

  const notifications = data?.items ?? []
  const total = data?.total ?? 0
  const hasMore = notifications.length < total

  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllRead } = useMarkAllNotificationsRead()

  const badgeLabel = total > 10 ? '10+' : total > 0 ? String(total) : null

  return (
    <NotificationDropdown
      notifications={notifications}
      total={total}
      hasMore={hasMore}
      isLoading={isLoading}
      isError={isError}
      onMarkRead={(id) => markAsRead(id)}
      onMarkAllRead={() => userId && markAllRead(userId)}
      onLoadMore={() => setLimit((l) => l + 10)}
      trigger={
        <button className="relative size-9 rounded-lg bg-background border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group flex items-center justify-center">
          <Bell className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          {badgeLabel && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none border-2 border-background">
              {badgeLabel}
            </span>
          )}
        </button>
      }
    />
  )
}
