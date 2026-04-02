'use client'

import React from 'react'
import { useMatches } from '@tanstack/react-router'
import {
  Bell,
} from 'lucide-react'
import { NotificationDropdown } from '@/features/notifications'
import { UserDropdown } from './user-dropdown'
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
  useUnreadNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotifications
} from '@/features/notifications/hooks/use-notifications'
import { Separator } from '@/components/ui/separator'

function DynamicBreadcrumb() {
  const matches = useMatches()

  const breadcrumbs = matches
    .filter(
      (match) =>
        match.id !== '/' && match.id !== '/_auth' && match.id !== '/dashboard',
    )
    .map((match) => {
      let title = 'Dashboard'
      if (match.id === '/dashboard/') title = 'Overview'
      if (match.id === '/dashboard/requests/') title = 'Demands Hub'
      if (match.id === '/dashboard/marketplace/') title = 'Live Feed'
      if (match.id === '/dashboard/quotes/') title = 'My Quotes'
      if (match.id === '/dashboard/audit/') title = 'Audit Log'
      if (match.id === '/dashboard/garage/') title = 'My Garage'
      if (match.id === '/dashboard/admin/buyers') title = 'Buyers Intelligence'
      if (match.id === '/dashboard/admin/sellers') title = 'Sellers Ecosystem'
      if (match.id === '/dashboard/admin/categories') title = 'Taxonomy Management'

      return { id: match.id, pathname: match.pathname, title }
    })

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({
      id: '/dashboard/',
      pathname: '/dashboard',
      title: 'Overview',
    })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
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
import { ThemeToggle } from '@/components/theme-toggle'

interface DashboardShellProps {
  children: React.ReactNode
  sidebarContent: React.ReactNode
}

export function DashboardShell({ children, sidebarContent }: DashboardShellProps) {
  const { data: user } = useAuth()
  const userId = user?.id || ''

  // Establish SSE connection for real-time updates
  useNotifications(userId)

  const { data: notifications = [] } = useUnreadNotifications(userId)
  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllRead } = useMarkAllNotificationsRead()

  const unreadCount = notifications.length

  return (
    <SidebarProvider>
      <AppSidebar>
        {sidebarContent}
      </AppSidebar>

      <SidebarInset className="bg-slate-50/50 dark:bg-slate-950/50 overflow-x-hidden min-h-svh">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors scale-110 md:scale-100" />
            <Separator orientation="vertical" className="mr-2 h-4 hidden md:block bg-slate-200 dark:bg-slate-800" />
            <div className="hidden md:block">
              <DynamicBreadcrumb />
            </div>
            {/* On mobile, show a simplified title or just the trigger */}
            <div className="md:hidden flex items-center gap-2 ml-1">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold tracking-tight uppercase">MLILA</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={(id) => markAsRead(id)}
              onMarkAllRead={() => markAllRead(userId)}
              trigger={
                <button className="relative size-9 md:size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/30 transition-all group flex items-center justify-center shadow-sm">
                  <Bell className="size-4.5 md:size-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 md:size-5 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg animate-in fade-in zoom-in duration-300">
                      {unreadCount}
                    </span>
                  )}
                </button>
              }
            />
            <UserDropdown />
          </div>
        </header>


        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-8 pt-0 mt-6 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
