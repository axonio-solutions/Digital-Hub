import { createFileRoute, redirect } from '@tanstack/react-router'
import { Download, ShieldCheck, Store, Users, Plus, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Components
import { AdminUsersTable } from '@/features/admin/components/users-table'

// Hooks
import {
  useAdminUsers,
  useToggleUserBan,
} from '@/features/admin/hooks/use-users'

export const Route = createFileRoute('/_authed/dashboard/users/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminUsersRoute,
})

function AdminUsersRoute() {
  const { data: users = [], isLoading } = useAdminUsers()
  const { mutate: toggleBan } = useToggleUserBan()

  if (isLoading) {
    return <AdminUsersSkeleton />;
  }

  const handleBanToggle = (userId: string, currentBanStatus: boolean) => {
    toggleBan({
      userId,
      isBanned: !currentBanStatus,
    })
  }

  // Stats calculation
  const totalUsers = users.length;
  const pendingVerifications = users.filter(u => !u.emailVerified).length;
  const activeSellers = users.filter(u => u.role === 'seller' && u.account_status === 'active').length;
  const waitlistedSellers = users.filter(u => u.account_status === 'waitlisted').length;

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-[1400px] mx-auto w-full pt-4">
      {/* Page Heading & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h2>
          <p className="text-slate-500 max-w-2xl">
            Manage buyers, sellers, and platform access permissions efficiently across the network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button disabled variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 gap-2 font-bold shadow-sm opacity-50 cursor-not-allowed">
            <Download size={16} />
            Export Data
          </Button>
          <Button disabled className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 font-bold shadow-sm opacity-50 cursor-not-allowed">
            <Plus size={16} />
            Add New User
          </Button>
        </div>
      </div>

      {/* Stats Overview - Premium Section Cards Style */}
      <div className="grid grid-cols-1 gap-4 px-0 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        {/* Registered Users */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Registered Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalUsers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Network Scale
            </div>
            <div className="text-muted-foreground">Total platform accounts</div>
          </CardFooter>
        </Card>

        {/* Waitlisted Sellers */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Waitlisted Sellers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-amber-600 dark:text-amber-500">
              {waitlistedSellers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Awaiting Approval
            </div>
            <div className="text-muted-foreground">Prospective merchant queue</div>
          </CardFooter>
        </Card>

        {/* Active Sellers */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Sellers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-500">
              {activeSellers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Verified Merchants
            </div>
            <div className="text-muted-foreground">Active supply-side partners</div>
          </CardFooter>
        </Card>

        {/* Pending Verifications */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Pending Email</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600 dark:text-blue-500">
              {pendingVerifications.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Identity Verification
            </div>
            <div className="text-muted-foreground">Users requiring confirmation</div>
          </CardFooter>
        </Card>
      </div>

      {/* Main Table Section */}
      <AdminUsersTable
        users={users}
        onBan={(id) => handleBanToggle(id, false)}
        onUnban={(id) => handleBanToggle(id, true)}
      />
    </div>
  )
}

function AdminUsersSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 max-w-[1400px] mx-auto w-full pt-4 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[80px]" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-3 w-[180px]" />
            </CardFooter>
          </Card>
        ))}
      </div>

      <Skeleton className="h-[600px] w-full rounded-2xl" />
    </div>
  );
}
