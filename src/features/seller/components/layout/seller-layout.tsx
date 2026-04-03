'use client'

import React from 'react'
import {
  IconDashboard,
  IconPick,
  IconMessages,
  IconSettings,
  IconHelpCircle,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard/layout')

  const sellerNavigation = {
    main: [
      {
        title: t('nav.overview'),
        url: '/dashboard',
        icon: IconDashboard,
      },
      {
        title: t('nav.live_requests'),
        url: '/dashboard/marketplace',
        icon: IconPick,
      },
      {
        title: t('nav.my_quotes'),
        url: '/dashboard/quotes',
        icon: IconMessages,
      },
    ],
    secondary: [
      {
        title: t('nav.settings'),
        url: '/dashboard/settings',
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
      <NavMain items={sellerNavigation.main} label={t('labels.seller_hub')} />
      <NavSecondary items={sellerNavigation.secondary} className="mt-auto" />
    </>
  )

  return <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
}
