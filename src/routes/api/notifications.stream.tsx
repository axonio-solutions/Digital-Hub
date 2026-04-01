import { createFileRoute } from '@tanstack/react-router'
import { notificationEvents } from '@/lib/events'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/notifications/stream')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // 1. Authenticate user session
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session) {
          return new Response('Unauthorized', { status: 401 })
        }

        const currentUserId = session.user.id

        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder()
            
            // Keep alive heartbeat Every 15 seconds
            const heartbeat = setInterval(() => {
              controller.enqueue(encoder.encode(': heartbeat\n\n'))
            }, 15000)

            const listener = (notification: any) => {
              if (!notification) return;
              
              // 2. Filter by userId strictly to avoid role leakage
              const notificationUserId = notification.userId || notification.user_id;

              if (notificationUserId === currentUserId) {
                console.log(`[SSE Stream] Enqueuing notification ${notification.id} for user ${currentUserId}`)
                
                try {
                  // Only enqueue if the stream is still active
                  if (!request.signal.aborted) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`))
                  }
                } catch (err) {
                  console.error(`[SSE Stream] Failed to enqueue notification for user ${currentUserId}:`, err)
                  // If we can't enqueue, we should probably stop listening
                  notificationEvents.off('notification', listener)
                }
              }
            }

            notificationEvents.on('notification', listener)

            // Cleanup when stream is closed or aborted
            request.signal.addEventListener('abort', () => {
              clearInterval(heartbeat)
              notificationEvents.off('notification', listener)
              try {
                controller.close()
              } catch (e) {
                // Ignore if already closed
              }
            })
          }
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      },
    },
  },
})
