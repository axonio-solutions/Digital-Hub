'use client'

import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, getFacetedRowModel, getFacetedUniqueValues, ColumnFiltersState, SortingState, flexRender } from '@tanstack/react-table'
import { Coins, UserX } from 'lucide-react'
import { UserProfileDialog } from './user-profile-dialog'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { cn } from '@/lib/utils'
import { useActivateSeller } from '@/features/admin/hooks/use-users'
import { getAccountStatuses, getIntegrityStatuses, getRoles } from '../data/user-filters'
import { useTranslation } from 'react-i18next'
import { GrantCreditsDialog } from '@/features/credits/components/grant-credits-dialog'

interface AdminUsersTableProps { users: Array<any>; onBan?: (userId: string) => void }

export function AdminUsersTable({ users = [], onBan }: AdminUsersTableProps) {
  const { t } = useTranslation('dashboard/admin')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [grantSeller, setGrantSeller] = useState<any | null>(null)
  const [isGrantOpen, setIsGrantOpen] = useState(false)
  const { mutate: activateSeller } = useActivateSeller()

  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const handleViewDetails = useCallback((user: any) => { setSelectedUser(user); setIsDialogOpen(true) }, [])

  const columns: Array<ColumnDef<any>> = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
      ),
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: 'name', header: t('users.columns.name'),
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-lg shrink-0"><AvatarImage src={u.image} /><AvatarFallback className="text-[10px] font-bold">{u.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback></Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground truncate max-w-[160px]">{u.name}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{u.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'role', header: t('users.columns.role'),
      cell: ({ row }) => <GlowingBadge variant="neutral" className="capitalize text-[10px]">{t(`users.roles.${row.original.role}`)}</GlowingBadge>,
    },
    {
      accessorKey: 'account_status', header: t('users.columns.status'),
      cell: ({ row }) => {
        const s = row.original.account_status || 'new'
        return <GlowingBadge variant={s === 'active' ? 'success' : s === 'waitlisted' ? 'warning' : 'neutral'} pulse={s === 'waitlisted'} className="capitalize text-[10px]">{t(`users.account_status.${s}`)}</GlowingBadge>
      },
    },
    {
      accessorKey: 'priorityScore', header: t('users.columns.score'),
      cell: ({ row }) => {
        const score = row.original.priorityScore
        if (row.original.role !== 'seller' || score === null) return <span className="text-muted-foreground text-xs">-</span>
        return <span className={cn('text-xs font-mono font-bold', score > 10 ? 'text-emerald-600 dark:text-emerald-400' : score > 5 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400')}>{score.toFixed(1)}</span>
      },
    },
    {
      accessorKey: 'banned', header: t('users.columns.integrity'),
      cell: ({ row }) => <GlowingBadge variant={row.original.banned ? 'error' : 'success'} pulse={row.original.banned} className="text-[10px]">{row.original.banned ? t('users.integrity.compromised') : t('users.integrity.secure')}</GlowingBadge>,
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {u.account_status === 'waitlisted' && (
              <Button variant="outline" size="sm" onClick={() => { activateSeller({ userId: u.id }); toast.success(t('users.actions.activated_success')) }} className="h-7 text-[10px]">{t('users.actions.activate')}</Button>
            )}
            {u.role === 'seller' && (
              <Button variant="outline" size="sm" onClick={() => { setGrantSeller(u); setIsGrantOpen(true) }} className="h-7 text-[10px] gap-1">
                <Coins className="size-3 text-amber-500" /> {t('users.actions.grant_credits')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(u)} className="h-7 text-[10px]">{t('users.actions.view')}</Button>
          </div>
        )
      },
    },
  ], [t, activateSeller, handleViewDetails])

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 20 } },
  })

  const selectedCount = table.getSelectedRowModel().rows.length

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <DataTableToolbar table={table} searchColumn="name" searchPlaceholder={t('users.search')} hideViewOptions
        facetedFilters={[
          { column: 'role', title: t('users.filters.role'), options: getRoles(t) },
          { column: 'banned', title: t('users.filters.status'), options: getIntegrityStatuses(t) },
          { column: 'account_status', title: t('users.filters.account'), options: getAccountStatuses(t) },
        ]}>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap">
              {t('users.actions.selected', { count: selectedCount })}
            </span>
            <Button variant="destructive" size="sm"
              onClick={() => { const ids = table.getSelectedRowModel().rows.map((r: any) => r.original.id); ids.forEach((id: string) => onBan?.(id)); table.resetRowSelection(); toast.error(t('users.actions.banned_success', { count: ids.length })) }}
              className="h-7 text-[10px]"><UserX className="me-1.5 size-3.5" /> {t('users.actions.ban')}</Button>
          </div>
        )}
      </DataTableToolbar>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="cursor-pointer"
                    onClick={() => handleViewDetails(row.original)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">No results</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      <UserProfileDialog user={selectedUser} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <GrantCreditsDialog
        seller={grantSeller ? { id: grantSeller.id, name: grantSeller.name, storeName: grantSeller.storeName } : null}
        open={isGrantOpen}
        onOpenChange={setIsGrantOpen}
        showPackages
      />
    </div>
  )
}
