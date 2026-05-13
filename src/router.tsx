import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
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

  const router = createTanstackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: { queryClient, user: null as any, session: null as any },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

export const getRouter = createRouter

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
