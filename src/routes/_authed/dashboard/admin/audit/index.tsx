import { useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Activity, TriangleAlert, Star, ClipboardList, Flag, TrendingUp, CalendarDays } from 'lucide-react'
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, getFacetedRowModel, getFacetedUniqueValues, ColumnFiltersState, SortingState, flexRender } from '@tanstack/react-table'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { cn } from '@/lib/utils'
import { useAllRequests } from '@/features/requests/hooks/use-requests'
import { requestKeys } from '@/features/requests/hooks/use-requests'

export const Route = createFileRoute('/_authed/dashboard/admin/audit/')({
  beforeLoad: ({ context }: any) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ context }) => {
    const { fetchAllRequestsServerFn } = await import('@/fn/requests')
    await context.queryClient.ensureQueryData({
      queryKey: requestKeys.allRequests(),
      queryFn: async () => { const res = await fetchAllRequestsServerFn(); if (!res.success) throw new Error(res.error); return res.data },
      staleTime: 2 * 60 * 1000,
    }).catch(() => {})
  },
  component: AuditRoute,
  pendingComponent: AuditSkeleton,
})

function AuditRoute() {
  const { t } = useTranslation('dashboard/audit')
  const { data: requests = [], isLoading } = useAllRequests()

  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const { pending, flagged, todayCount, conversion } = useMemo(() => {
    const today = new Date().toDateString()
    const total = requests.length
    const p = requests.filter((r: any) => r.status === 'open').length
    const f = requests.filter((r: any) => r.isSpam).length
    const t = requests.filter((r: any) => new Date(r.createdAt).toDateString() === today).length
    const withQuotes = requests.filter((r: any) => r.quotes?.length > 0).length
    const c = total > 0 ? ((withQuotes / total) * 100).toFixed(1) : '0'
    return { pending: p, flagged: f, todayCount: t, conversion: `${c}%` }
  }, [requests])

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
      accessorKey: 'partName', header: t('table.columns.part_info'),
      cell: ({ row }) => {
        const r = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
              <AvatarImage src={r.imageUrls?.[0]} className="object-cover" />
              <AvatarFallback className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg">{r.partName?.substring(0, 2).toUpperCase() || 'P'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground truncate max-w-[180px]">{r.partName}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">#{r.oemNumber || r.id?.substring(0, 8)}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'vehicleBrand', header: t('table.columns.vehicle_profile'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
            {row.original.brand?.imageUrl ? (
              <img src={row.original.brand.imageUrl} alt="" className="size-4 object-contain" />
            ) : (
              <span className="text-[9px] font-bold text-muted-foreground">{(row.original.vehicleBrand || '?').substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground">{row.original.vehicleBrand}</span>
            <span className="text-[10px] text-muted-foreground">{row.original.modelYear}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'quotes', header: t('table.columns.market_traction'),
      cell: ({ row }) => {
        const q = row.original.quotes?.length || 0
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[0, 1, 2].slice(0, Math.min(q, 3)).map((i) => (
                <div key={i} className="size-6 rounded-full border-2 border-background bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity className="size-3 text-slate-400" />
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{q}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status', header: t('table.columns.status'),
      cell: ({ row }) => {
        const s = row.original.status
        const isSpam = row.original.isSpam
        const isPriority = row.original.isPriority
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <GlowingBadge variant={s === 'open' ? 'success' : s === 'fulfilled' ? 'info' : 'neutral'} pulse={s === 'open'} className="capitalize text-[10px]">
              {s === 'open' ? t('table.filters.status.open') : s === 'fulfilled' ? t('table.filters.status.fulfilled') : s}
            </GlowingBadge>
            {isPriority && <GlowingBadge variant="warning" pulse className="flex items-center gap-1 text-[10px]"><Star className="size-3" />{t('table.columns.status_types.priority')}</GlowingBadge>}
            {isSpam && <GlowingBadge variant="error" className="flex items-center gap-1 text-[10px]"><TriangleAlert className="size-3" />{t('table.columns.status_types.spam')}</GlowingBadge>}
          </div>
        )
      },
    },
  ], [t])

  const table = useReactTable({
    data: requests,
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

  const metrics = [
    { label: t('stats.pending.label'), value: pending.toLocaleString(), icon: Activity, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { label: t('stats.flagged.label'), value: flagged.toLocaleString(), icon: Flag, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
    { label: t('stats.today.label'), value: todayCount.toLocaleString(), icon: CalendarDays, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: t('stats.conversion.label'), value: conversion, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  ]

  if (isLoading && !requests.length) {
    return <AuditSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-amber-500/20 shrink-0">
            <ClipboardList className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{t('title')}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t('description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="size-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{requests.length} total</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={cn('flex flex-col items-center gap-1 px-3 py-3 rounded-2xl', m.color)}>
            <div className="flex items-center gap-1.5">
              <m.icon className="size-4" />
              <span className="text-xl font-black tabular-nums leading-none">{m.value}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <DataTableToolbar table={table} searchColumn="partName" searchPlaceholder={t('table.search')} hideViewOptions
        facetedFilters={[
          { column: 'status', title: t('table.filters.status.title'), options: [
            { label: t('table.filters.status.open'), value: 'open' },
            { label: t('table.filters.status.fulfilled'), value: 'fulfilled' },
          ]},
        ]} />

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">{t('table.no_results', 'No requests found')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}

function AuditSkeleton() {
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
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-[500px] w-full rounded-2xl" />
    </div>
  )
}
