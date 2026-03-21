import {
  createRootRouteWithContext,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import * as React from 'react'

// 1. Import the unified DevTools wrapper
import { TanStackDevtools } from '@tanstack/react-devtools'

// 2. Import the *Panel* versions (not the floating default ones)
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

import type { MyRouterContext } from '@/types/router'
import { DefaultNotFound } from './components/errors/-default-not-found'
import { authQueries } from '@/features/auth/queries/auth-queries'
import styles from '../styles.css?url'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData(authQueries.user());
      return {
        user
      };
    } catch (error) {
      console.error("Auth Session Error:", error);
      return {
        user: null
      };
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
    ],
  }),
  component: () => {
    return (
      <RootDocument>
        <Outlet />
        <Toaster />

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
            __html: `console.log("DevTools Render Context - DEV:", ${import.meta.env.DEV ? 'true' : 'false'}, "MODE:", "${import.meta.env.MODE}");`
          }}
        />
      </RootDocument>
    );
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