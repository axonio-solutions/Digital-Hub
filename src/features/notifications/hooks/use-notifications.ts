import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchUnreadNotificationsServerFn,
  markAllNotificationsReadServerFn,
  markNotificationReadServerFn,
} from '@/fn/notifications'

/**
 * SSE Subscription Hook
 * Connects to the server-sent events stream for real-time updates
 */
export function useNotifications(_userId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!_userId) return

    console.log('[SSE Client] Connecting to /api/notifications/stream...')
    const eventSource = new EventSource('/api/notifications/stream')

    eventSource.onopen = () => {
      console.log('[SSE Client] Connection established.')
    }

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        console.log('[SSE Client] Notification received:', notification)
        
        // 1. Broadly invalidate related caches for real-time updates
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        
        // If the notification has a referenceId (like requestId), target it specifically
        if (notification.referenceId) {
          console.log(`[SSE Client] Invalidating specific request/quote data for ID: ${notification.referenceId}`)
          
          // Fix: Align with requestKeys.details structure -> ['requests', 'details', requestId]
          queryClient.invalidateQueries({ queryKey: ['requests', 'details', notification.referenceId] })
          
          // Also invalidate generic lists if this is a new lead or status change
          if (notification.type === 'NEW_LEAD') {
            queryClient.invalidateQueries({ queryKey: ['requests', 'open'] })
            queryClient.invalidateQueries({ queryKey: ['marketplace'] })
          }
          
          queryClient.invalidateQueries({ queryKey: ['quotes', notification.referenceId] })
        } else {
          // If no specific reference, invalidate general collections
          queryClient.invalidateQueries({ queryKey: ['requests'] })
          queryClient.invalidateQueries({ queryKey: ['quotes'] })
        }
        
        // Ensure immediate refetch for active queries to provide "instant" feel
        queryClient.refetchQueries({ type: 'active' })

        // 2. Optimistically update the unread notification cache
        queryClient.setQueryData(['notifications'], (oldData: any) => {
          if (!Array.isArray(oldData)) return [notification]
          // Avoid duplicate entries if already in cache
          if (oldData.some(n => n.id === notification.id)) return oldData
          return [notification, ...oldData]
        })

        // 3. Trigger Visual Feedback (Default Sonner Design)
        const isErrorType = ['ABANDONED_REQUEST', 'SPAM_FLAG', 'BOTTLENECK_ALERT'].includes(notification.type)
        
        if (isErrorType) {
          toast.error(notification.title, {
            description: notification.message,
            duration: 8000,
          })
        } else {
          toast.success(notification.title, {
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
      } catch (err) {
        console.error('[SSE Client] Error parsing notification:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[SSE Client] connection error:', err)
      eventSource.close()
    }

    return () => {
      eventSource.close()
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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
