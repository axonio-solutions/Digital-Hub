'use client'

import React from 'react'
import { Link } from '@tanstack/react-router'
import { type Icon } from '@tabler/icons-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

interface NavItem {
  title: string
  url: string
  icon: Icon
  isActive?: boolean
}

export function NavMain({
  items,
  label = 'Platform',
}: {
  items: NavItem[]
  label?: string
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 px-4 mb-2">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1 px-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
                className="h-10 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              >
                <Link
                  to={item.url}
                  activeOptions={{ exact: item.url === '/dashboard' }}
                  onClick={() => isMobile && setOpenMobile(false)}
                  className="flex items-center gap-3 font-medium text-sm px-3"
                  activeProps={{
                    className: 'bg-primary/10 text-primary !font-bold border-e-2 border-primary shadow-sm shadow-primary/5',
                  }}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
