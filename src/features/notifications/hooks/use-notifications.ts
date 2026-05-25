import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from '@tanstack/react-router'
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
  const router = useRouter()

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
            // Always refetch the notification list so the dropdown reflects server state
            // with the correct { items, total } shape. Cache-patching is avoided because
            // the Supabase payload is snake_case while the cache holds camelCase Drizzle rows.
            queryClient.invalidateQueries({
              queryKey: ['notifications', 'unread', _userId],
              exact: false,
            })

            if (payload.eventType === 'DELETE') return

            if (
              payload.eventType === 'INSERT' ||
              payload.eventType === 'UPDATE'
            ) {
              const notification = payload.new

              // Invalidate business-data caches based on notification metadata
              if (notification.metadata?.requestId) {
                const { requestId } = notification.metadata

                queryClient.invalidateQueries({
                  queryKey: ['requests', 'details', requestId],
                })
                queryClient.invalidateQueries({
                  queryKey: ['buyer', 'requests', _userId],
                })
                queryClient.invalidateQueries({
                  queryKey: ['requests', 'open'],
                })
                // Always invalidate seller queries — the receiving user may be a
                // seller whose quote or dashboard is affected regardless of whether
                // the notification carries a quoteId.
                queryClient.invalidateQueries({
                  queryKey: ['seller', 'quotes', _userId],
                })
                queryClient.invalidateQueries({
                  queryKey: ['seller', 'dashboard', _userId],
                })
                queryClient.invalidateQueries({
                  queryKey: ['credits', 'my-balance'],
                })
                // Invalidate marketplace queries so the request detail page
                // reflects fulfilled status and disables the submit-offer button.
                queryClient.invalidateQueries({
                  queryKey: ['marketplace'],
                  exact: false,
                })
              }

              // Toast for new notifications only
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
                  toast.error(title, { description: message, duration: 8000 })
                } else {
                  toast.success(title, {
                    description: message,
                    duration: 5000,
                    action: notification.link_url
                      ? {
                          label: _t('toast.view'),
                          onClick: () => {
                            router.navigate({ to: notification.link_url })
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
      await queryClient.cancelQueries({
        queryKey: ['notifications', 'unread'],
        exact: false,
      })

      // Snapshot all matching unread queries for rollback
      const snapshots = queryClient
        .getQueryCache()
        .findAll({ queryKey: ['notifications', 'unread'], exact: false })
        .map((query) => ({ key: query.queryKey, data: query.state.data }))

      // Optimistically remove the notification from every { items, total } cache
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['notifications', 'unread'], exact: false })
        .forEach((query) => {
          queryClient.setQueryData(query.queryKey, (old: any) => {
            if (!old?.items) return old
            const filtered = old.items.filter((n: any) => n.id !== id)
            return { items: filtered, total: Math.max(0, filtered.length) }
          })
        })

      return { snapshots }
    },
    onError: (_err, _id, context) => {
      context?.snapshots?.forEach(({ key, data }: any) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread'],
        exact: false,
      })
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
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['notifications', 'unread'],
        exact: false,
      })

      const snapshots = queryClient
        .getQueryCache()
        .findAll({ queryKey: ['notifications', 'unread'], exact: false })
        .map((query) => ({ key: query.queryKey, data: query.state.data }))

      // Optimistically clear all unread caches
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['notifications', 'unread'], exact: false })
        .forEach((query) => {
          queryClient.setQueryData(query.queryKey, { items: [], total: 0 })
        })

      return { snapshots }
    },
    onError: (_err, _userId, context) => {
      context?.snapshots?.forEach(({ key, data }: any) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread'],
        exact: false,
      })
    },
  })
}
