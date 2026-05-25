'use client'

import React from 'react'
import {
  IconActivity,
  IconArchive,
  IconBuildingStore,
  IconChartBar,
  IconReportMoney,
  IconSend,
  IconSettings,
  IconTag,
  IconUsers,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from '@/lib/routes'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard/layout')

  const adminNavigation = [
    {
      title: t('nav.global_metrics'),
      url: DASHBOARD_ROUTES.ROOT,
      icon: IconActivity,
    },
    {
      title: t('nav.market_intelligence'),
      url: ADMIN_ROUTES.INTELLIGENCE,
      icon: IconChartBar,
    },
    {
      title: t('nav.buyers_hub'),
      url: ADMIN_ROUTES.BUYERS,
      icon: IconUsers,
    },
    {
      title: t('nav.sellers_hub'),
      url: ADMIN_ROUTES.SELLERS,
      icon: IconBuildingStore,
    },
    {
      title: t('nav.categories'),
      url: ADMIN_ROUTES.CATEGORIES,
      icon: IconTag,
    },
    {
      title: t('nav.revenue'),
      url: ADMIN_ROUTES.REVENUE,
      icon: IconReportMoney,
    },
    {
      title: t('nav.request_audit'),
      url: ADMIN_ROUTES.AUDIT_LOG,
      icon: IconArchive,
    },
    {
      title: t('nav.user_moderation'),
      url: ADMIN_ROUTES.USERS,
      icon: IconUsers,
    },
    {
      title: t('nav.credit_requests'),
      url: ADMIN_ROUTES.CREDIT_REQUESTS,
      icon: IconSend,
    },
  ]

  const secondaryNavigation = [
    {
      title: t('nav.admin_profile'),
      url: DASHBOARD_ROUTES.PROFILE,
      icon: IconSettings,
    },
  ]

  const sidebarContent = (
    <>
      <NavMain items={adminNavigation} label={t('labels.admin_control')} />
      <NavSecondary items={secondaryNavigation} className="mt-auto" />
    </>
  )

  return (
    <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
  )
}
