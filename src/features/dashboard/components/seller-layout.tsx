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
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ListTodo, FileText, TrendingUp } from 'lucide-react'
import { UserDropdown } from './user-dropdown'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

function DynamicSellerBreadcrumb() {
  const matches = useMatches()
  
  // Filter out internal/layout routes to keep the breadcrumb clean
  const breadcrumbs = matches
    .filter(match => match.id !== '/' && match.id !== '/_auth' && match.id !== '/seller')
    .map((match) => {
      let title = "Dashboard"
      if (match.id === '/seller/') title = "Available Requests"
      if (match.id === '/seller/quotes/') title = "My Quotes"
      if (match.id === '/seller/earnings/') title = "Earnings"
  
      return { id: match.id, pathname: match.pathname, title }
    })

  // If we are exactly on the layout route but matches says something else, fallback
  if (breadcrumbs.length === 0) {
     breadcrumbs.push({ id: '/seller/', pathname: '/seller', title: 'Available Requests' })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/seller" className="hidden sm:inline-block">Seller Hub</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:inline-block" />
        
        {breadcrumbs.map((crumb, index) => {
           const isLast = index === breadcrumbs.length - 1
           
           // Skip rendering generic "Dashboard" if we're already hardcoding it as the root
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

export function SellerLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
        {/* Left App Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarHeader className="h-16 flex items-center px-6 border-b border-border">
            <h2 className="text-xl font-bold tracking-tight text-primary">MLILA Seller</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Seller Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Available Requests">
                      <a href="/seller">
                        <ListTodo className="w-4 h-4 mr-2" />
                        <span>Available Requests</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="My Quotes">
                      <a href="/seller/quotes">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>My Quotes</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Earnings">
                      <a href="/seller/earnings">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span>Earnings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <div className="h-4 w-[1px] bg-border mx-2 hidden sm:block" />
              <div className="hidden sm:flex">
                 <DynamicSellerBreadcrumb />
              </div>
            </div>
            <div className="flex items-center gap-4">
               <NotificationBell />
               <UserDropdown />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
