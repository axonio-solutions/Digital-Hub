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
  IconUsers,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard/layout')

  const adminNavigation = [
    {
      title: t('nav.global_metrics'),
      url: '/dashboard',
      icon: IconActivity,
    },
    {
      title: t('nav.market_intelligence'),
      url: '/dashboard/admin/intelligence',
      icon: IconChartBar,
    },
    {
      title: t('nav.buyers_hub'),
      url: '/dashboard/admin/buyers',
      icon: IconUsers,
    },
    {
      title: t('nav.sellers_hub'),
      url: '/dashboard/admin/sellers',
      icon: IconBuildingStore,
    },
    {
      title: t('nav.revenue'),
      url: '/dashboard/admin/revenue',
      icon: IconReportMoney,
    },
    {
      title: t('nav.request_audit'),
      url: '/dashboard/admin/audit',
      icon: IconArchive,
    },
    {
      title: t('nav.user_moderation'),
      url: '/dashboard/admin/users',
      icon: IconUsers,
    },
    {
      title: t('nav.credit_requests'),
      url: '/dashboard/admin/credit-requests',
      icon: IconSend,
    },
  ]

  const secondaryNavigation = [
    {
      title: t('nav.admin_profile'),
      url: '/dashboard/profile',
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
