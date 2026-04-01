'use client'

import React from 'react'
import {
  IconActivity,
  IconUsers,
  IconBuildingStore,
  IconHierarchy,
  IconArchive,
  IconSettings,
  IconHelpCircle,
} from '@tabler/icons-react'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'

const adminNavigation = {
  main: [
    {
      title: 'Global Metrics',
      url: '/dashboard',
      icon: IconActivity,
    },
    {
      title: 'User Moderation',
      url: '/dashboard/users',
      icon: IconUsers,
    },
    {
      title: 'Buyers Hub',
      url: '/dashboard/admin/buyers',
      icon: IconUsers,
    },
    {
      title: 'Sellers Hub',
      url: '/dashboard/admin/sellers',
      icon: IconBuildingStore,
    },
    {
      title: 'Categories',
      url: '/dashboard/admin/categories',
      icon: IconHierarchy,
    },
    {
      title: 'Request Audit',
      url: '/dashboard/audit',
      icon: IconArchive,
    },
  ],
  secondary: [
    {
      title: 'Admin Settings',
      url: '/dashboard/admin/settings',
      icon: IconSettings,
    },
    {
      title: 'Cloud logs',
      url: '/dashboard/admin/logs',
      icon: IconActivity,
    },
    {
      title: 'Support',
      url: '/dashboard/support',
      icon: IconHelpCircle,
    },
  ],
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebarContent = (
    <>
      <NavMain items={adminNavigation.main} label="Admin Control" />
      <NavSecondary items={adminNavigation.secondary} className="mt-auto" />
    </>
  )

  return <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
}
