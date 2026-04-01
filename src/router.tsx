import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

/**
 * Axis Layer 3: Router & Query Integration
 * This follows the pattern of creating the QueryClient inside the router
 * to ensure deep integration and proper SSR hydration.
 */
export const createRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  })

  const router = routerWithQueryClient(
    createTanstackRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient, user: null as any, session: null as any },
      scrollRestoration: true,
      // react-query will handle data fetching & caching
      defaultPreloadStaleTime: 0,
    }),
    queryClient,
  )

  return router
}

export const getRouter = createRouter

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
