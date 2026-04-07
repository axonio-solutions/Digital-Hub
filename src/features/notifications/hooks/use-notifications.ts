import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'
import {
  fetchUnreadNotificationsServerFn,
  markAllNotificationsReadServerFn,
  markNotificationReadServerFn,
} from '@/fn/notifications'

/**
 * Supabase Realtime Subscription Hook
 * Connects directly to Postgres via WebSockets for real-time updates
 */
export function useNotifications(_userId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!_userId) return

    console.log('[Supabase Realtime] Connecting to notifications table...')
    
    // SSR-safe Supabase client instantiation
    const supabase = createBrowserClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )

    // Using a random suffix prevents React StrictMode double mounts from reusing
    // a channel that is already in the 'SUBSCRIBED' state.
    const channelName = `notifications_${_userId}_${Math.random().toString(36).substring(7)}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${_userId}`,
        },
        (payload) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const notification = payload.new
              console.log('[Supabase Realtime] Notification received:', notification)

              // Optimistically update the unread notification cache array
              // Do NOT use refetchQueries per execution protocol
              queryClient.setQueryData(['notifications'], (oldData: any) => {
                if (!Array.isArray(oldData)) return [notification]
                
                if (payload.eventType === 'UPDATE') {
                  return oldData.map(n => n.id === notification.id ? notification : n)
                }
                
                // Avoid duplicate entries if already in cache
                if (oldData.some(n => n.id === notification.id)) return oldData
                return [notification, ...oldData]
              })
              
              // Patch the specific unread query as well to ensure UI consistency
              queryClient.setQueryData(['notifications', 'unread', _userId], (oldData: any) => {
                if (!Array.isArray(oldData)) return [notification]
                if (payload.eventType === 'UPDATE') {
                  return oldData.map(n => n.id === notification.id ? notification : n)
                }
                if (oldData.some(n => n.id === notification.id)) return oldData
                return [notification, ...oldData]
              })

              // Trigger Visual Feedback for new notifications
              if (payload.eventType === 'INSERT') {
                const isErrorType = ['ABANDONED_REQUEST', 'SPAM_FLAG', 'BOTTLENECK_ALERT'].includes(notification.type)
                
                if (isErrorType) {
                  toast.error(notification.title || 'Alert', {
                    description: notification.message,
                    duration: 8000,
                  })
                } else {
                  toast.success(notification.title || 'New Notification', {
                    description: notification.message,
                    duration: 5000,
                    action: notification.linkUrl ? {
                      label: 'View',
                      onClick: () => {
                        window.location.href = notification.linkUrl
                      }
                    } : undefined,
                  })
                }
              }
            }
          } catch (err) {
            console.error('[Supabase Realtime] Error handling notification payload:', err)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connection established.')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Supabase Realtime] connection error')
        }
      })

    return () => {
      console.log('[Supabase Realtime] Cleaning up subscription...')
      supabase.removeChannel(channel)
    }
  }, [queryClient, _userId])
}

/**
 * Query for unread notifications
 */
export function useUnreadNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => fetchUnreadNotificationsServerFn(),
    enabled: !!userId,
  })
}

/**
 * Mutation to mark a single notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationReadServerFn({ data: id }),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      // Snapshot previous data
      const previousNotifications = queryClient.getQueryData(['notifications'])

      // Optimistically update: Filter out the read notification
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!Array.isArray(old)) return old
        return old.filter((n: any) => n.id !== id)
      })

      // We also try to patch any unread specific queries we can find in the cache
      // This is a "best effort" optimistic update for nested keys
      queryClient.getQueryCache().findAll({ queryKey: ['notifications', 'unread'] }).forEach(query => {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!Array.isArray(old)) return old
          return old.filter((n: any) => n.id !== id)
        })
      })

      return { previousNotifications }
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}


/**
 * Mutation to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (_userId: string) => markAllNotificationsReadServerFn(),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      const previousNotifications = queryClient.getQueryData(['notifications'])
      const previousUnread = queryClient.getQueryData(['notifications', 'unread', userId])

      // Optimistically clear everything
      queryClient.setQueryData(['notifications'], [])
      queryClient.setQueryData(['notifications', 'unread', userId], [])

      return { previousNotifications, previousUnread }
    },
    onError: (_err, _userId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(['notifications', 'unread', _userId], context.previousUnread)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

