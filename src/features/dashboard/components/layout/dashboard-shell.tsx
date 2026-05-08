'use client'

import React from 'react'
import { useMatches } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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
  const matches = useMatches()

  const breadcrumbs = matches
    .filter(
      (match) =>
        match.id !== '/' && match.id !== '/_auth' && match.id !== '/dashboard',
    )
    .map((match) => {
      let title = t('breadcrumbs.dashboard')
      if (match.id === '/dashboard/') title = t('breadcrumbs.overview')
      if (match.id === '/dashboard/requests/') title = t('breadcrumbs.demands_hub')
      if (match.id === '/dashboard/offers/') title = t('breadcrumbs.offers')
      if (match.id === '/dashboard/history/') title = t('breadcrumbs.history')
      if (match.id === '/dashboard/profile/') title = t('breadcrumbs.profile')
      if (match.id === '/dashboard/marketplace/') title = t('breadcrumbs.live_feed')
      if (match.id === '/dashboard/quotes/') title = t('breadcrumbs.my_quotes')
      if (match.id === '/dashboard/audit/') title = t('breadcrumbs.audit_log')
      if (match.id === '/dashboard/garage/') title = t('breadcrumbs.my_garage')
      if (match.id === '/dashboard/users') title = t('breadcrumbs.user_moderation')
      if (match.id === '/dashboard/admin/buyers') title = t('breadcrumbs.buyers_intelligence')
      if (match.id === '/dashboard/admin/sellers') title = t('breadcrumbs.sellers_ecosystem')
      if (match.id === '/dashboard/admin/categories') title = t('breadcrumbs.taxonomy_management')
      if (match.id === '/dashboard/admin/settings') title = t('breadcrumbs.admin_settings')
      if (match.id === '/dashboard/admin/logs') title = t('breadcrumbs.cloud_logs')
      if (match.id === '/dashboard/support') title = t('breadcrumbs.support')
      if (match.id === '/dashboard/requests/$requestId') title = t('breadcrumbs.request_detail')

      return { id: match.id, pathname: match.pathname, title }
    })

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({
      id: '/dashboard/',
      pathname: '/dashboard',
      title: t('breadcrumbs.overview'),
    })
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
          if (crumb.title === 'Dashboard') return null

          return (
            <React.Fragment key={crumb.id}>
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

  // Establish SSE connection for real-time updates
  useNotifications(userId)

  return (
    <SidebarProvider>
      <AppSidebar>
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
