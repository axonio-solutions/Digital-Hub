import { useMemo } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Download, Plus, Users, Shield, Store, MailQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { AdminUsersTable } from '@/features/admin/components/users-table'
import { useAdminUsers, useToggleUserBan } from '@/features/admin/hooks/use-users'
import { adminKeys } from '@/features/admin/hooks/use-admin'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authed/dashboard/admin/users/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ context }) => {
    const { getAllUsersServerFn } = await import('@/fn/admin')
    await context.queryClient.ensureQueryData({
      queryKey: adminKeys.users(),
      // @ts-ignore
      queryFn: () => getAllUsersServerFn(),
      staleTime: 2 * 60 * 1000,
    }).catch(() => {})
  },
  component: AdminUsersRoute,
  pendingComponent: AdminUsersSkeleton,
})

function AdminUsersRoute() {
  const { t } = useTranslation('dashboard/users')
  const { data: user } = useAuth()
  const { data: users = [], isLoading } = useAdminUsers()
  const { mutate: toggleBan } = useToggleUserBan()

  const { totalUsers, pendingVerifications, activeSellers, waitlistedSellers } = useMemo(() => ({
    totalUsers: users.length,
    pendingVerifications: users.filter((u: any) => !u.emailVerified).length,
    activeSellers: users.filter((u: any) => u.role === 'seller' && u.account_status === 'active').length,
    waitlistedSellers: users.filter((u: any) => u.account_status === 'waitlisted').length,
  }), [users])

  const handleBanToggle = useMemo(() => (userId: string, currentBanStatus: boolean) => {
    toggleBan({ userId, isBanned: !currentBanStatus })
  }, [toggleBan])

  const metrics = useMemo(() => [
    { label: t('stats.registered.label'), value: totalUsers, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: t('stats.waitlisted.label'), value: waitlistedSellers, icon: Shield, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { label: t('stats.active_sellers.label'), value: activeSellers, icon: Store, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: t('stats.pending_email.label'), value: pendingVerifications, icon: MailQuestion, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30' },
  ], [t, totalUsers, waitlistedSellers, activeSellers, pendingVerifications])

  if (isLoading && !users.length) {
    return <AdminUsersSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-violet-500/20 shrink-0">
            {(user?.name || 'A').charAt(0)}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{t('title')}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t('description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 gap-2 font-bold text-xs uppercase tracking-wider shadow-sm opacity-50 cursor-not-allowed">
            <Download size={14} /> {t('buttons.export')}
          </Button>
          <Button disabled className="h-10 px-4 rounded-xl bg-primary text-primary-foreground gap-2 font-bold text-xs uppercase tracking-wider shadow-sm opacity-50 cursor-not-allowed">
            <Plus size={14} /> {t('buttons.add_user')}
          </Button>
        </div>
      </div>

      {/* Compact Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={cn('flex flex-col items-center gap-1 px-3 py-3 rounded-2xl', m.color)}>
            <div className="flex items-center gap-1.5">
              <m.icon className="size-4" />
              <span className="text-xl font-black tabular-nums leading-none">{m.value.toLocaleString()}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          {users.length > 0 ? `${users.length} users` : null}
        </p>
        <AdminUsersTable users={users} onBan={(id: string) => handleBanToggle(id, false)} />
      </div>
    </div>
  )
}

function AdminUsersSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
      </div>
      <Skeleton className="h-3.5 w-20 rounded-md" />
      <Skeleton className="h-[500px] w-full rounded-2xl" />
    </div>
  )
}
