import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'

// 1. Import the unified DevTools wrapper
import { TanStackDevtools } from '@tanstack/react-devtools'

// 2. Import the *Panel* versions (not the floating default ones)
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

import styles from '../styles.css?url'
import { DefaultNotFound } from './components/errors/-default-not-found'
import type { MyRouterContext } from '@/types/router'
import { authQueries } from '@/features/auth/queries/auth-queries'
import { Toaster } from '@/components/ui/sonner'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData(authQueries.user())
      return {
        user,
      }
    } catch (error) {
      console.error('Auth Session Error:', error)
      return {
        user: null,
      }
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Digital Hub - Marketplace',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: styles,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: '',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
      },
    ],
  }),
  component: () => {
    const { user } = Route.useRouteContext()
    // Subscribe to real-time notifications
    useNotifications(user?.id)

    return (
      <RootDocument>
        <Outlet />
        <Toaster position="bottom-right" closeButton />

        {/* Render the unified devtools button with tabs for each plugin */}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Query',
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("DevTools Render Context - DEV:", ${import.meta.env.DEV ? 'true' : 'false'}, "MODE:", "${import.meta.env.MODE}");`,
          }}
        />
      </RootDocument>
    )
  },
  notFoundComponent: DefaultNotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
