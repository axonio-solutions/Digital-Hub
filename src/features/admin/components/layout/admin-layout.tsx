'use client'

import React from 'react'
import {
  IconActivity,
  IconUsers,
  IconBuildingStore,
  IconHierarchy,
  IconArchive,
  IconSettings,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { NavMain } from '@/features/dashboard/components/layout/nav-main'
import { NavSecondary } from '@/features/dashboard/components/layout/nav-secondary'
import { DashboardShell } from '@/features/dashboard/components/layout/dashboard-shell'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard/layout')

  const adminNavigation = {
    main: [
      {
        title: t('nav.global_metrics'),
        url: '/dashboard',
        icon: IconActivity,
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
    ],
    secondary: [
      {
        title: t('nav.user_moderation'),
        url: '/dashboard/admin/users',
        icon: IconUsers,
      },
      {
        title: t('nav.categories'),
        url: '/dashboard/admin/categories',
        icon: IconHierarchy,
      },
      {
        title: t('nav.request_audit'),
        url: '/dashboard/admin/audit',
        icon: IconArchive,
      },
      {
        title: t('nav.admin_settings'),
        url: '/dashboard/admin/settings',
        icon: IconSettings,
      },
    ],
  }

  const sidebarContent = (
    <>
      <NavMain items={adminNavigation.main} label={t('labels.admin_control')} />
      <NavSecondary items={adminNavigation.secondary} className="mt-auto" />
    </>
  )

  return <DashboardShell sidebarContent={sidebarContent}>{children}</DashboardShell>
}
