import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => {
        return auth.handler(request)
      },
      POST: async ({ request }) => {
        console.log(`\n--- AUTH API POST: ${request.url} ---`)
        const cloned = request.clone()
        try {
          const body = await cloned.json()
          console.log('Body:', JSON.stringify(body, null, 2))
        } catch (e) {
          console.log('Body: (not JSON or empty)')
        }
        console.log('-------------------------------\n')
        return auth.handler(request)
      },
    },
  },
})
