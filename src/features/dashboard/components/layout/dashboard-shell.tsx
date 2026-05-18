'use client'

import React from 'react'
import { useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useDirection } from '@radix-ui/react-direction'
import { NotificationBell } from '@/features/notifications'
import { UserMenu } from '@/components/navigation/user-menu'
import { NavControls } from '@/components/navigation/nav-controls'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useNotifications
} from '@/features/notifications/hooks/use-notifications'
import { Separator } from '@/components/ui/separator'

function DynamicBreadcrumb() {
  const { t } = useTranslation('dashboard/layout')
  const location = useLocation()
  const pathname = location.pathname

  const CRUMB_MAP: Record<string, string> = {
    '/dashboard': t('breadcrumbs.overview'),
    '/dashboard/': t('breadcrumbs.overview'),
    '/dashboard/requests': t('breadcrumbs.demands_hub'),
    '/dashboard/quotes': t('breadcrumbs.my_quotes'),
    '/dashboard/profile': t('breadcrumbs.profile'),
    '/dashboard/billing': t('breadcrumbs.billing'),
    '/dashboard/audit': t('breadcrumbs.audit_log'),
    '/dashboard/users': t('breadcrumbs.user_moderation'),
    '/dashboard/support': t('breadcrumbs.support'),
    '/dashboard/admin/buyers': t('breadcrumbs.buyers_intelligence'),
    '/dashboard/admin/sellers': t('breadcrumbs.sellers_ecosystem'),
    '/dashboard/admin/categories': t('breadcrumbs.taxonomy_management'),
    '/dashboard/admin/users': t('breadcrumbs.user_moderation'),
    '/dashboard/admin/audit': t('breadcrumbs.audit_log'),
    '/dashboard/admin/intelligence': t('breadcrumbs.market_intelligence'),
    '/dashboard/admin/revenue': t('breadcrumbs.revenue'),
    '/dashboard/admin/credit-requests': t('breadcrumbs.credit_requests'),
  }

  let breadcrumbs: Array<{ pathname: string; title: string }> = []

  const requestMatch = pathname.match(/^\/dashboard\/requests\/(.+)$/)
  if (requestMatch) {
    breadcrumbs = [
      { pathname: '/dashboard/requests', title: t('breadcrumbs.demands_hub') },
      { pathname, title: t('breadcrumbs.request_detail') },
    ]
  } else if (CRUMB_MAP[pathname]) {
    breadcrumbs = [{ pathname, title: CRUMB_MAP[pathname] }]
  } else {
    breadcrumbs = [{ pathname: '/dashboard', title: t('breadcrumbs.overview') }]
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">{t('breadcrumbs.dashboard')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <React.Fragment key={crumb.pathname}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.pathname}>
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

import { AppSidebar } from './app-sidebar'

interface DashboardShellProps {
  children: React.ReactNode
  sidebarContent: React.ReactNode
}

export function DashboardShell({ children, sidebarContent }: DashboardShellProps) {
  const { data: user } = useAuth()
  const userId = user?.id || ''
  const dir = useDirection()

  // Establish SSE connection for real-time updates
  useNotifications(userId)

  return (
    <SidebarProvider>
      <AppSidebar side={dir === 'rtl' ? 'right' : 'left'}>
        {sidebarContent}
      </AppSidebar>

      <SidebarInset className="bg-background overflow-x-hidden min-h-svh">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14 backdrop-blur-md bg-background/70 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1.5 hover:bg-accent rounded-lg transition-colors scale-110 md:scale-100" />
            <Separator orientation="vertical" className="me-2 h-4 hidden md:block bg-border" />
            <div className="hidden md:block">
              <DynamicBreadcrumb />
            </div>
            {/* On mobile, show a simplified title or just the trigger */}
            <div className="md:hidden flex items-center gap-2 ms-1">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-sm font-bold tracking-tight uppercase">MLILA</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <NavControls />
            <NotificationBell />
            <UserMenu user={user} role={user?.role || 'buyer'} />
          </div>
        </header>


        <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-6 pt-0 mt-4 md:mt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
