'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconLoader,
} from '@tabler/icons-react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useBuyerColumns } from './buyer-columns'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import {
  useCancelRequest,
  useDeleteRequest,
  useReopenRequest,
} from '@/features/requests/hooks/use-requests'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface RequestsListViewProps {
  data: Array<any>
  onAction?: (action: { type: string; item: any }) => void
}

function useBrandOptions(data: Array<any>) {
  return useMemo(() => {
    const brands = new Set<string>()
    data.forEach((r: any) => {
      const brandName = r.vehicleBrand || r.brand?.brand
      if (brandName) brands.add(brandName)
    })
    return Array.from(brands)
      .sort()
      .map((brand) => ({ label: brand, value: brand }))
  }, [data])
}

export function BuyerListView({ data, onAction }: RequestsListViewProps) {
  const { t } = useTranslation('requests/list')
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelRequest()
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest()
  const { mutate: reopenRequest, isPending: isReopening } = useReopenRequest()

  const columns = useBuyerColumns(
    onAction,
    {
      cancelRequest,
      deleteRequest,
      reopenRequest,
      isCancelling,
      isDeleting,
      isReopening,
    },
    t,
  )

  const brandOptions = useBrandOptions(data)
  const [columnFilters, setColumnFilters] = useState<Array<any>>([])
  const [sorting, setSorting] = useState<Array<any>>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchColumn="partName"
        searchPlaceholder={t('filters.search_placeholder')}
        hideViewOptions
        facetedFilters={[
          {
            column: 'status',
            title: t('filters.status'),
            options: [
              {
                label: t('filters.statuses.open'),
                value: 'open',
                icon: IconLoader,
              },
              {
                label: t('filters.statuses.fulfilled'),
                value: 'fulfilled',
                icon: IconCircleCheckFilled,
              },
              {
                label: t('filters.statuses.cancelled'),
                value: 'cancelled',
                icon: IconCircleXFilled,
              },
            ],
          },
          {
            column: 'vehicleBrand',
            title: t('filters.brand'),
            options: brandOptions,
          },
        ]}
      />

      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn('cursor-pointer')}
                    onClick={() =>
                      onAction?.({ type: 'view_request', item: row.original })
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t('empty.title', 'No demands found')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
