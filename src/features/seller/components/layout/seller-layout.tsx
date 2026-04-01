'use client'

import React from 'react'
import {
  IconDashboard,
  IconPick,
  IconMessages,
  IconSettings,
  IconHelpCircle,
} from '@tabler/icons-react'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'

const sellerNavigation = {
  main: [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Live Requests',
      url: '/dashboard/marketplace',
      icon: IconPick,
    },
    {
      title: 'My Quotes',
      url: '/dashboard/quotes',
      icon: IconMessages,
    },
  ],
  secondary: [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: IconSettings,
    },
    {
      title: 'Help & Support',
      url: '/dashboard/support',
      icon: IconHelpCircle,
    },
  ],
}

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const sidebarContent = (
    <>
      <NavMain items={sellerNavigation.main} label="Seller Hub" />
      <NavSecondary items={sellerNavigation.secondary} className="mt-auto" />
    </>
  )

  return <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
}
