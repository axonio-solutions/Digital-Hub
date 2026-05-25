'use client'

import React from 'react'
import {
  IconCoin,
  IconDashboard,
  IconHelpCircle,
  IconMessages,
  IconSearch,
  IconSettings,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'
import { DASHBOARD_ROUTES, PUBLIC_ROUTES, SELLER_ROUTES } from '@/lib/routes'

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard/layout')

  const sellerNavigation = {
    main: [
      {
        title: t('nav.overview'),
        url: DASHBOARD_ROUTES.ROOT,
        icon: IconDashboard,
      },
      {
        title: t('nav.my_quotes'),
        url: SELLER_ROUTES.QUOTES,
        icon: IconMessages,
      },
      {
        title: t('nav.explore_marketplace'),
        url: PUBLIC_ROUTES.EXPLORE,
        icon: IconSearch,
      },
      {
        title: t('nav.billing'),
        url: SELLER_ROUTES.BILLING,
        icon: IconCoin,
      },
    ],
    secondary: [
      {
        title: t('nav.settings'),
        url: DASHBOARD_ROUTES.PROFILE,
        icon: IconSettings,
      },
      {
        title: t('nav.support'),
        url: DASHBOARD_ROUTES.SUPPORT,
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

  return (
    <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
  )
}
