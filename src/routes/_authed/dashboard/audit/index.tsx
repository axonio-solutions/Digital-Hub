import { useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  TriangleAlert,
  Star,
} from 'lucide-react'
import type { User } from '@/lib/auth'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

import { useAllRequests } from '@/features/requests/hooks/use-requests'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { RequestDetailsDialog } from '@/features/requests/components/request-details-dialog'
import { cn } from '@/lib/utils'
import { DataTable } from '@/components/ui/data-table/data-table'

// ...
export const Route = createFileRoute('/_authed/dashboard/audit/')({
  beforeLoad: ({ context }) => {
    const user = context.user as User
    if (user?.role !== 'admin') {
      throw (redirect as any)({ to: '/dashboard' })
    }
  },
  component: AdminRequestsRoute,
})

function AdminRequestsRoute() {
  const { t } = useTranslation('dashboard/audit')
  const { data: requests = [], isLoading } = useAllRequests()
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r: any) => r.status === 'open').length
    const flagged = requests.filter((r: any) => r.isSpam).length
    const requestsWithQuotes = requests.filter(
      (r: any) => r.quotes && r.quotes.length > 0,
    ).length
    const conversion = total > 0 ? (requestsWithQuotes / total) * 100 : 0
    
    const today = new Date().toDateString()
    const totalToday = requests.filter(
      (r: any) => new Date(r.createdAt).toDateString() === today
    ).length

    return [
      { 
        label: t('stats.pending.label'), 
        value: pending.toLocaleString(), 
        description: t('stats.pending.desc'),
        detail: t('stats.pending.detail'),
        color: 'amber'
      },
      {
        label: t('stats.flagged.label'),
        value: flagged.toLocaleString(),
        description: t('stats.flagged.desc'),
        detail: t('stats.flagged.detail'),
        color: 'red'
      },
      {
        label: t('stats.today.label'),
        value: totalToday.toLocaleString(),
        description: t('stats.today.desc'),
        detail: t('stats.today.detail'),
        color: 'blue'
      },
      {
        label: t('stats.conversion.label'),
        value: `${conversion.toFixed(1)}%`,
        description: t('stats.conversion.desc'),
        detail: t('stats.conversion.detail'),
        color: 'emerald'
      },
    ]
  }, [requests])

  const columns: Array<ColumnDef<any>> = useMemo(
    () => [
      {
        id: 'select',
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
        accessorKey: 'partName',
        header: t('table.columns.part_info'),
        cell: ({ row }) => {
          const request = row.original
          const mainImage = request.imageUrls?.[0]
          
          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="size-10 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden shrink-0">
                <AvatarImage src={mainImage} className="object-cover" />
                <AvatarFallback className="bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-300 font-bold text-xs rounded-none">
                  {request.partName?.substring(0, 2).toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                  {request.partName}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                  #{request.oemNumber || t('table.columns.global_id')}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'vehicleBrand',
        header: t('table.columns.vehicle_profile'),
        cell: ({ row }) => {
          const createdAt = row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '';
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-900 dark:text-white">
                {row.original.vehicleBrand}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  {row.original.modelYear}
                </span>
                {createdAt && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {createdAt}
                    </span>
                  </>
                )}
              </div>
            </div>
          )
        }
      },
      {
        id: 'traction',
        header: t('table.columns.market_traction'),
        cell: ({ row }) => {
          const qCount = row.original.quotes?.length || 0
          return (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(Math.min(qCount, 3))].map((_, i) => (
                  <div key={i} className="size-6 rounded-full border-2 border-white bg-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <Activity className="size-3 text-slate-400" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {qCount} {qCount === 1 ? t('table.columns.responses.singular') : t('table.columns.responses.plural')}
              </span>
            </div>
          )
        }
      },
      {
        accessorKey: 'status',
        header: t('table.columns.status'),
        cell: ({ row }) => {
          const status = row.original.status;
          const isSpam = row.original.isSpam;
          const isPriority = row.original.isPriority;
          
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md border shadow-sm",
                  status === 'open' ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" :
                  status === 'fulfilled' ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800" :
                  "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                )}
              >
                {status === 'open' ? t('table.filters.status.open') : 
                 status === 'fulfilled' ? t('table.filters.status.fulfilled') : 
                 status}
              </Badge>
              {isPriority && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md border shadow-sm flex items-center gap-1">
                  <Star className="size-3" />
                  {t('table.columns.status_types.priority')}
                </Badge>
              )}
              {isSpam && (
                <Badge className="bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md border shadow-sm flex items-center gap-1">
                  <TriangleAlert className="size-3" />
                  {t('table.columns.status_types.spam')}
                </Badge>
              )}
            </div>
          )
        }
      },
    ],
    [],
  )

  if (isLoading) {
    return <AuditSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-[1400px] mx-auto w-full pt-4 px-6 md:px-10">
      {/* Page Heading & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            {t('title')}
          </h2>
          <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Stats Overview - Premium Section Cards Style */}
      <div className="grid grid-cols-1 gap-4 px-0 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className={cn(
                "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
                item.color === 'amber' ? "text-amber-600 dark:text-amber-500" :
                item.color === 'red' ? "text-red-600 dark:text-red-500" :
                item.color === 'blue' ? "text-blue-600 dark:text-blue-500" :
                "text-emerald-600 dark:text-emerald-500"
              )}>
                {item.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {item.description}
              </div>
              <div className="text-muted-foreground">{item.detail}</div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      {/* Table Section */}
      <DataTable
        data={requests}
        columns={columns}
        onRowClick={(row) => {
          setSelectedRequest(row)
          setIsSheetOpen(true)
        }}
        toolbar={(table) => (
          <DataTableToolbar 
            table={table} 
            searchColumn="partName"
            searchPlaceholder={t('table.search')}
            facetedFilters={[
              {
                column: "status",
                title: t('table.filters.status.title'),
                options: [
                  { label: t('table.filters.status.open'), value: "open" },
                  { label: t('table.filters.status.fulfilled'), value: "fulfilled" },
                ],
              },
            ]}
          />
        )}
      />

      <RequestDetailsDialog
        request={selectedRequest}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  )
}

function AuditSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 max-w-[1400px] mx-auto w-full pt-4 px-6 md:px-10 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] h-[500px]">
          <div className="h-12 border-b border-slate-50 flex items-center px-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-slate-50/50 flex items-center px-6 gap-4">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-4 flex-1 rounded-sm" />
              <Skeleton className="h-4 flex-1 rounded-sm" />
              <Skeleton className="h-4 flex-1 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
