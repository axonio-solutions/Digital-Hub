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
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { 
  useActivateSeller,
} from '@/features/admin/hooks/use-users'
import { accountStatuses, integrityStatuses, roles } from '../data/user-filters'

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
        header: 'Name',
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
        header: 'Role',
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <Badge variant="outline" className="capitalize">
              {role}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'account_status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.account_status || 'new';
          return (
            <Badge 
              variant={
                status === 'active' ? 'default' : 
                status === 'waitlisted' ? 'secondary' : 
                'outline'
              }
              className="capitalize"
            >
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'priorityScore',
        header: 'Score',
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
        header: 'Integrity',
        cell: ({ row }) => {
          const isBanned = row.original.banned;
          return (
            <Badge 
              variant={isBanned ? "destructive" : "outline"}
              className="text-[10px]"
            >
              {isBanned ? "Banned" : "Active"}
            </Badge>
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
                    toast.success("Seller activated");
                  }}
                  className="h-8"
                >
                  Activate
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(user)}
                className="h-8"
              >
                View
              </Button>
            </div>
          )
        },
      },
    ],
    [onBan, onUnban, activateSeller],
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
              searchPlaceholder="Search users..."
              facetedFilters={[
                {
                  column: 'role',
                  title: 'Role',
                  options: roles,
                },
                {
                  column: 'banned',
                  title: 'Status',
                  options: integrityStatuses,
                },
                {
                  column: 'account_status',
                  title: 'Account',
                  options: accountStatuses,
                }
              ]}
            >
               {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {selectedCount} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        const ids = selectedRows.map((r: any) => r.original.id);
                        ids.forEach((id: string) => onBan?.(id));
                        table.resetRowSelection();
                        toast.error(`Banned ${ids.length} users`);
                    }}
                    className="h-8"
                  >
                    <UserX className="me-2 h-4 w-4" />
                    Ban Selected
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
