import { Outlet, useMatches } from '@tanstack/react-router'
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Pickaxe, Activity, Users, CarFront, Package, MessageSquare, LayoutDashboard, ClipboardList, Store } from 'lucide-react'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { UserDropdown } from './user-dropdown'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Link } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

function DynamicBreadcrumb() {
  const matches = useMatches()

  const breadcrumbs = matches
    .filter(match => match.id !== '/' && match.id !== '/_auth' && match.id !== '/dashboard')
    .map((match) => {
      let title = "Dashboard"
      if (match.id === '/dashboard/') title = "Overview"
      if (match.id === '/dashboard/requests/') title = "Demands Hub"
      if (match.id === '/dashboard/marketplace/') title = "Live Feed"
      if (match.id === '/dashboard/quotes/') title = "My Quotes"
      if (match.id === '/dashboard/audit/') title = "Audit Log"
      if (match.id === '/dashboard/garage/') title = "My Garage"
      if (match.id === '/dashboard/admin/buyers') title = "Buyers Intelligence"
      if (match.id === '/dashboard/admin/sellers') title = "Sellers Ecosystem"

      return { id: match.id, pathname: match.pathname, title }
    })

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ id: '/dashboard/', pathname: '/dashboard', title: 'Overview' })
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
          if (crumb.title === "Dashboard") return null

          return (
            <React.Fragment key={crumb.id}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.pathname}>{crumb.title}</BreadcrumbLink>
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

export function UnifiedDashboardLayout() {
  const { data: user } = useAuth()
  const role = user?.role || 'buyer'

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="flex items-center justify-center p-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Pickaxe className="size-4" />
            </div>
            <span className="truncate font-bold text-lg hidden md:block group-data-[collapsible=icon]:hidden">
              MLILA
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="capitalize font-medium opacity-70">
              {role === 'buyer' ? 'Buyer Dashboard' : role === 'seller' ? 'Seller Hub' : 'Admin Control'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>

                {/* BUYER LINKS */}
                {(role === 'buyer' || !role) && (
                  <>
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Overview">
                          <Link
                            to="/dashboard"
                            activeOptions={{ exact: true }}
                            className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                            activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                          >
                            <LayoutDashboard className="size-4" />
                            <span>Overview</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Demands Hub">
                          <Link
                            to="/dashboard/requests"
                            className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                            activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                          >
                            <ClipboardList className="size-4" />
                            <span>Demands Hub</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="My Garage">
                          <Link
                            to="/dashboard/garage"
                            className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                            activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                          >
                            <CarFront className="size-4" />
                            <span>My Garage</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  </>
                )}

                {/* SELLER LINKS */}
                {role === 'seller' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Overview">
                        <Link
                          to="/dashboard"
                          activeOptions={{ exact: true }}
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <LayoutDashboard className="size-4" />
                          <span>Overview</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Live Requests">
                        <Link
                          to="/dashboard/marketplace"
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <Pickaxe className="size-4" />
                          <span>Live Requests</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="My Quotes">
                        <Link
                          to="/dashboard/quotes"
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <MessageSquare className="size-4" />
                          <span>My Quotes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* ADMIN LINKS */}
                {role === 'admin' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Global Metrics">
                        <Link
                          to="/dashboard"
                          activeOptions={{ exact: true }}
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <Activity className="size-4" />
                          <span>Global Metrics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="User Moderation">
                        <Link
                          to="/dashboard/users"
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <Users className="size-4" />
                          <span>User Moderation</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Buyers Intelligence">
                        <Link
                          to="/dashboard/admin/buyers"
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <Users className="size-4 text-blue-600" />
                          <span>Buyers Hub</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Sellers Ecosystem">
                        <Link
                          to="/dashboard/admin/sellers"
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <Store className="size-4 text-emerald-600" />
                          <span>Sellers Hub</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Request Audit Log">
                        <Link
                          to="/dashboard/audit"
                          className="transition-all rounded-md overflow-hidden hover:bg-muted font-medium"
                          activeProps={{ className: "bg-primary/10 text-primary border-r-2 border-primary" }}
                        >
                          <Package className="size-4" />
                          <span>Request Audit</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          {/* Inject footer elements here if required, user info is handled up top */}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
          <div className="flex items-center gap-4 px-4">
            <NotificationBell />
            <UserDropdown />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-8 pt-0 mt-6 md:mt-8">
          <Outlet />
        </main>
      </SidebarInset>

    </SidebarProvider>
  )
}
