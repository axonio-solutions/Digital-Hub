'use client'

import React from 'react'
import {
  IconDashboard,
  IconClipboardList,
  IconCar,
  IconSettings,
  IconHelpCircle,
} from '@tabler/icons-react'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'

const buyerNavigation = {
  main: [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Demands Hub',
      url: '/dashboard/requests',
      icon: IconClipboardList,
    },
    {
      title: 'My Garage',
      url: '/dashboard/garage',
      icon: IconCar,
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

export function BuyerLayout({ children }: { children: React.ReactNode }) {
  const sidebarContent = (
    <>
      <NavMain items={buyerNavigation.main} label="Buyer Hub" />
      <NavSecondary items={buyerNavigation.secondary} className="mt-auto" />
    </>
  )

  return <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
}
