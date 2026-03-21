import { useState, useMemo } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { type User } from '@/lib/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  FilterX,
  ArrowUpDown,
  Info,
  TrendingUp,
  Box,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

// Hooks
import { useAllRequests } from "@/features/requests/hooks/use-requests"
import { RequestsTableToolbar } from '@/features/requests/components/requests-table-toolbar'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { RequestDetailsDialog } from '@/features/requests/components/request-details-dialog'
import { NexusStatCard } from '@/components/ui/nexus-stat-card'
import { cn } from '@/lib/utils'

// ...
export const Route = createFileRoute('/_authed/dashboard/audit/')({
  beforeLoad: ({ context }) => {
    const user = context.user as User;
    if (user?.role !== 'admin') {
      throw (redirect as any)({ to: '/dashboard' })
    }
  },
  component: AdminRequestsRoute,
})

function AdminRequestsRoute() {
  const { data: requests = [], isLoading } = useAllRequests()
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Table States
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = requests.length
    const active = requests.filter((r: any) => r.status === 'open').length
    const withQuotes = requests.filter((r: any) => r.quotes && r.quotes.length > 0).length
    const conversion = total > 0 ? Math.round((withQuotes / total) * 100) : 0

    return [
      { label: "Total Volume", value: total, icon: Box, color: "blue" },
      { label: "Active Demands", value: active, icon: Activity, color: "rose", isPrimary: true },
      { label: "Market Traction", value: `${conversion}%`, icon: TrendingUp, color: "indigo" },
      { label: "Today's Pulse", value: requests.filter((r: any) => new Date(r.createdAt).toDateString() === new Date().toDateString()).length, icon: Clock, color: "emerald" },
    ]
  }, [requests])

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "Identity",
      cell: ({ row }) => {
        const req = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {req.id.substring(0, 8)}
            </div>
            <div className="text-xs font-bold text-slate-600">
              {new Date(req.createdAt).toLocaleDateString()}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "vehicleBrand",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-black text-slate-400 uppercase tracking-widest text-[10px]"
        >
          Vehicle Profile
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="font-bold text-slate-900 tracking-tight leading-none mb-1">
            {row.original.vehicleBrand}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {row.original.modelYear}
          </div>
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "partName",
      header: "Listed Issue",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <div className="font-bold text-slate-800 text-sm tracking-tight">{row.original.partName}</div>
          {row.original.oemNumber && (
            <div className="text-[9px] font-mono font-black border border-slate-200 bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 w-fit uppercase">
              OEM: {row.original.oemNumber}
            </div>
          )}
        </div>
      )
    },
    {
      id: "traction",
      header: "Market Traction",
      cell: ({ row }) => {
        const qCount = row.original.quotes?.length || 0;
        return (
          <div>
            {qCount > 0 ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-tighter">
                {qCount} Quotes Active
              </Badge>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">Awaiting Signal</span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "font-black text-[9px] uppercase tracking-tighter px-2.5 py-0.5 rounded-full border-0",
            row.original.status === 'open' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          )}
        >
          {row.original.status === 'open' ? 'Active Demand' : 'Stored'}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Control</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900"
            onClick={() => {
              setSelectedRequest(row.original)
              setIsSheetOpen(true)
            }}
          >
            <Info className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: requests,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Establishing Audit Stream...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Audit Command</h2>
          <p className="text-muted-foreground font-medium">Monitoring the global pulse of demand signals across the MLILA marketplace.</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <Activity className="size-3 text-emerald-500" /> System Watch: Active
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <NexusStatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as any}
            isPrimary={stat.isPrimary}
          />
        ))}
      </div>

      <div className="space-y-4">
        <RequestsTableToolbar table={table} />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-5 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group hover:bg-slate-50/50 transition-colors border-slate-100 cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(row.original)
                      setIsSheetOpen(true)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-8">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FilterX className="size-12 text-slate-200" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching demands identified</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <DataTablePagination table={table} />
          </div>
        </div>
      </div>

      <RequestDetailsDialog
        request={selectedRequest}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  )
}
