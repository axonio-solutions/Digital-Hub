'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ColumnDef,
} from '@tanstack/react-table'
import {
  UserX,
} from 'lucide-react'
import { UserProfileDialog } from './user-profile-dialog'
import { Badge } from '@/components/ui/badge'
import { GlowingBadge } from "@/components/unlumen-ui/glowing-badge";
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { 
  useActivateSeller,
} from '@/features/admin/hooks/use-users'
import { getAccountStatuses, getIntegrityStatuses, getRoles } from '../data/user-filters'
import { useTranslation } from 'react-i18next'

interface AdminUsersTableProps {
  users: Array<any>
  onBan?: (userId: string) => void
  onUnban?: (userId: string) => void
}

export function AdminUsersTable({
  users = [],
  onBan,
  onUnban,
}: AdminUsersTableProps) {
  const { t } = useTranslation('dashboard/admin')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { mutate: activateSeller } = useActivateSeller()

  const columns: Array<ColumnDef<any>> = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        id: 'name',
        header: t('users.columns.name'),
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} />
                <AvatarFallback>
                  {user.name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'role',
        header: t('users.columns.role'),
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <GlowingBadge variant="neutral" dot={false} className="capitalize">
              {t(`users.roles.${role}`)}
            </GlowingBadge>
          );
        },
      },
      {
        accessorKey: 'account_status',
        header: t('users.columns.status'),
        cell: ({ row }) => {
          const status = row.original.account_status || 'new';
          return (
            <GlowingBadge 
              variant={
                status === 'active' ? 'success' : 
                status === 'waitlisted' ? 'warning' : 
                'neutral'
              }
              pulse={status === 'waitlisted'}
              className="capitalize"
            >
              {t(`users.account_status.${status}`)}
            </GlowingBadge>
          )
        },
      },
      {
        accessorKey: 'priorityScore',
        header: t('users.columns.score'),
        cell: ({ row }) => {
          const score = row.original.priorityScore;
          if (row.original.role !== 'seller' || score === null) return (
            <span className="text-muted-foreground">-</span>
          );
          
          return (
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-mono font-bold",
                score > 10 ? "text-green-600" : score > 5 ? "text-blue-600" : "text-amber-600"
              )}>
                {score.toFixed(1)}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: 'banned',
        header: t('users.columns.integrity'),
        cell: ({ row }) => {
          const isBanned = row.original.banned;
          return (
            <GlowingBadge 
              variant={isBanned ? "error" : "success"}
              pulse={isBanned}
              className="text-[10px]"
            >
              {isBanned ? t('users.integrity.compromised') : t('users.integrity.secure')}
            </GlowingBadge>
          )
        },
      },
      {
        id: 'quick-actions',
        header: '',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-end gap-2">
              {user.account_status === 'waitlisted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    activateSeller({ userId: user.id });
                    toast.success(t('users.actions.activated_success'));
                  }}
                  className="h-8"
                >
                  {t('users.actions.activate')}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(user)}
                className="h-8"
              >
                {t('users.actions.view')}
              </Button>
            </div>
          )
        },
      },
    ],
    [onBan, onUnban, activateSeller, t],
  )

  const handleViewDetails = (user: any) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        data={users}
        columns={columns}
        toolbar={(table: any) => {
          const selectedRows = table.getSelectedRowModel().rows;
          const selectedCount = selectedRows.length;

          return (
            <DataTableToolbar
              table={table}
              searchColumn="name"
              searchPlaceholder={t('users.search')}
              facetedFilters={[
                {
                  column: 'role',
                  title: t('users.filters.role'),
                  options: getRoles(t),
                },
                {
                  column: 'banned',
                  title: t('users.filters.status'),
                  options: getIntegrityStatuses(t),
                },
                {
                  column: 'account_status',
                  title: t('users.filters.account'),
                  options: getAccountStatuses(t),
                }
              ]}
            >
               {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {t('users.actions.selected', { count: selectedCount })}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        const ids = selectedRows.map((r: any) => r.original.id);
                        ids.forEach((id: string) => onBan?.(id));
                        table.resetRowSelection();
                        toast.error(t('users.actions.banned_success', { count: ids.length }));
                    }}
                    className="h-8"
                  >
                    <UserX className="me-2 h-4 w-4" />
                    {t('users.actions.ban')}
                  </Button>
                </div>
              )}
            </DataTableToolbar>
          )
        }}
        onRowClick={handleViewDetails}
      />


      <UserProfileDialog
        user={selectedUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
