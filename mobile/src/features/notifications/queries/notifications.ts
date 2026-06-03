import { queryOptions } from '@tanstack/react-query'
import { fetchUnreadNotifications } from '../../../lib/api-client'

export const unreadNotificationsQueryOptions = queryOptions({
  queryKey: ['unread-notifications'],
  queryFn: fetchUnreadNotifications,
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
})
