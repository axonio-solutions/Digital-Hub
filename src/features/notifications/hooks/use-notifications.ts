import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('notifications')
  const tRef = useRef(t)
  tRef.current = t
  const hasConnectedRef = useRef(false)

  useEffect(() => {
    if (!_userId) return

    console.log('[Supabase Realtime] Connecting to notifications table...')

    const supabase = createBrowserClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )

    const channelName = `notifications_${_userId}`

    // createBrowserClient is a singleton — on StrictMode remount the old channel
    // may still be in its internal map in SUBSCRIBED state. Remove it first so
    // the subsequent .on() call doesn't throw "cannot add callbacks after subscribe".
    supabase
      .getChannels()
      .filter((c) => c.topic === `realtime:${channelName}`)
      .forEach((c) => supabase.removeChannel(c))

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
            if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id
              if (deletedId) {
                queryClient.setQueryData(
                  ['notifications', 'unread', _userId],
                  (old: any) => {
                    if (!Array.isArray(old)) return old
                    return old.filter((n: any) => n.id !== deletedId)
                  },
                )
                queryClient.setQueryData(['notifications'], (old: any) => {
                  if (!Array.isArray(old)) return old
                  return old.filter((n: any) => n.id !== deletedId)
                })
              }
              return
            }

            if (
              payload.eventType === 'INSERT' ||
              payload.eventType === 'UPDATE'
            ) {
              const notification = payload.new
              console.log(
                '[Supabase Realtime] Notification received:',
                notification,
              )

              // Optimistically update the unread notification cache array
              // Do NOT use refetchQueries per execution protocol
              queryClient.setQueryData(['notifications'], (oldData: any) => {
                if (!Array.isArray(oldData)) return [notification]

                if (payload.eventType === 'UPDATE') {
                  return oldData.map((n) =>
                    n.id === notification.id ? notification : n,
                  )
                }

                // Avoid duplicate entries if already in cache
                if (oldData.some((n) => n.id === notification.id))
                  return oldData
                return [notification, ...oldData]
              })

              // Patch the specific unread query as well to ensure UI consistency
              queryClient.setQueryData(
                ['notifications', 'unread', _userId],
                (oldData: any) => {
                  if (!Array.isArray(oldData)) return [notification]
                  if (payload.eventType === 'UPDATE') {
                    return oldData.map((n) =>
                      n.id === notification.id ? notification : n,
                    )
                  }
                  if (oldData.some((n) => n.id === notification.id))
                    return oldData
                  return [notification, ...oldData]
                },
              )

              // --- Real-time Cache Invalidation ---
              // Instead of patching with partial metadata, invalidate affected caches
              // so TanStack Query refetches from the server. This ensures full data consistency.
              if (notification.metadata?.requestId) {
                const { requestId, quoteId, quoteStatus } =
                  notification.metadata
                console.log(
                  `[Supabase Realtime] Invalidating caches for request ${requestId}`,
                )

                queryClient.invalidateQueries({
                  queryKey: ['requests', 'details', requestId],
                })
                queryClient.invalidateQueries({
                  queryKey: ['buyer', 'requests', _userId],
                })
                queryClient.invalidateQueries({
                  queryKey: ['requests', 'open'],
                })

                if (quoteId && quoteStatus) {
                  queryClient.invalidateQueries({
                    queryKey: ['seller', 'quotes', _userId],
                  })
                  queryClient.invalidateQueries({
                    queryKey: ['seller', 'dashboard', _userId],
                  })
                  queryClient.invalidateQueries({
                    queryKey: ['credits', 'my-balance'],
                  })
                }
              }
              // Trigger Visual Feedback for new notifications
              if (payload.eventType === 'INSERT') {
                const _t = tRef.current
                const typeKey = (notification.type ?? '').toLowerCase()
                const isErrorType = [
                  'abandoned_request',
                  'spam_flag',
                  'bottleneck_alert',
                ].includes(typeKey)
                const title = _t(`types.${typeKey}`, {
                  defaultValue: notification.title || _t('toast.alert'),
                })
                const message = _t(`messages.${typeKey}`, {
                  defaultValue: notification.message,
                })

                if (isErrorType) {
                  toast.error(title, {
                    description: message,
                    duration: 8000,
                  })
                } else {
                  toast.success(title, {
                    description: message,
                    duration: 5000,
                    action: notification.linkUrl
                      ? {
                          label: _t('toast.view'),
                          onClick: () => {
                            window.location.href = notification.linkUrl
                          },
                        }
                      : undefined,
                  })
                }
              }
            }
          } catch (err) {
            console.error(
              '[Supabase Realtime] Error handling notification payload:',
              err,
            )
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connection established.')
          if (hasConnectedRef.current) {
            // Reconnect — fetch any notifications missed while offline
            queryClient.invalidateQueries({
              queryKey: ['notifications', 'unread', _userId],
              exact: false,
            })
          }
          hasConnectedRef.current = true
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
export function useUnreadNotifications(userId: string, limit = 10) {
  return useQuery({
    queryKey: ['notifications', 'unread', userId, limit],
    queryFn: () => fetchUnreadNotificationsServerFn({ data: limit }),
    enabled: !!userId,
    staleTime: 60 * 1000,
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
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['notifications', 'unread'] })
        .forEach((query) => {
          queryClient.setQueryData(query.queryKey, (old: any) => {
            if (!Array.isArray(old)) return old
            return old.filter((n: any) => n.id !== id)
          })
        })

      return { previousNotifications }
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ['notifications'],
          context.previousNotifications,
        )
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
      const previousUnread = queryClient.getQueryData([
        'notifications',
        'unread',
        userId,
      ])

      // Optimistically clear everything
      queryClient.setQueryData(['notifications'], [])
      queryClient.setQueryData(['notifications', 'unread', userId], [])

      return { previousNotifications, previousUnread }
    },
    onError: (_err, _userId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ['notifications'],
          context.previousNotifications,
        )
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(
          ['notifications', 'unread', _userId],
          context.previousUnread,
        )
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
