'use client'

import React from 'react'
import {
  IconClipboardList,
  IconDashboard,
  IconHelpCircle,
  IconSettings,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'

export function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard/layout')

  const buyerNavigation = {
    main: [
      {
        title: t('nav.overview'),
        url: '/dashboard',
        icon: IconDashboard,
      },
      {
        title: t('nav.demands_hub'),
        url: '/dashboard/requests',
        icon: IconClipboardList,
      },
    ],
    secondary: [
      {
        title: t('nav.settings'),
        url: '/dashboard/profile',
        icon: IconSettings,
      },
      {
        title: t('nav.support'),
        url: '/dashboard/support',
        icon: IconHelpCircle,
      },
    ],
  }

  const sidebarContent = (
    <>
      <NavMain items={buyerNavigation.main} label={t('labels.buyer_hub')} />
      <NavSecondary items={buyerNavigation.secondary} className="mt-auto" />
    </>
  )

  return <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
}
