import { createFileRoute, redirect } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Users, Download, ShieldAlert } from "lucide-react"

// Components
import { AdminUsersTable } from "@/features/admin/components/users-table"

// Hooks
import { useAdminUsers, useToggleUserBan } from "@/features/admin/hooks/use-users"

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
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">
        <Users className="mr-2 h-4 w-4 animate-spin" />
        Synchronizing Global Identity Database...
      </div>
    )
  }

  const handleBanToggle = (userId: string, currentBanStatus: boolean) => {
    toggleBan({
      userId,
      isBanned: !currentBanStatus
    })
  }

  return (
    <div className="flex flex-col space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase italic">User Moderation</h2>
          <p className="text-muted-foreground">
            Enforce platform integrity, manage credentials, and monitor regional registrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="font-bold gap-2 shadow-sm border-slate-200">
            <Download className="size-3.5" /> Export DB (CSV)
          </Button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
          <div className="bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-2 text-[10px] font-black text-red-600">
            <ShieldAlert className="size-3" /> RESTRICTED ACCESS AREA
          </div>
        </div>
      </div>

      <AdminUsersTable
        users={users}
        onBan={(id) => handleBanToggle(id, false)}
        onUnban={(id) => handleBanToggle(id, true)}
      />
    </div>
  )
}
