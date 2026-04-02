'use client'

import * as React from 'react'
import { Pickaxe } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'


export function AppSidebar({
  children,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:!w-20 border-e-0 shadow-xl" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/10 dark:border-slate-800/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent focus-visible:ring-0">
              <Link to="/dashboard" className="flex items-center gap-3 transition-all duration-300 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_16px_-6px_rgba(var(--primary),0.5)] transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 group-data-[collapsible=icon]:size-9">
                  <Pickaxe className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  <span className="truncate font-black text-xl tracking-[0.2em] leading-none uppercase">
                    MLILA
                  </span>
                  <span className="truncate text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">
                    Digital Hub
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-4 px-2 scrollbar-none">
        {children}

        {/* Placeholder for secondary navigation sections if needed */}
      </SidebarContent>


    </Sidebar>
  )
}

