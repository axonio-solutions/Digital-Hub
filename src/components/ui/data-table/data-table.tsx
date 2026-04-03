'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
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


import { DataTablePagination } from './data-table-pagination'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  toolbar?: React.ReactNode | ((table: any) => React.ReactNode)
  pagination?: boolean
  className?: string
  rowClassName?: string
  onRowClick?: (row: TData) => void
  components?: {
    row?: React.ComponentType<{ row: any; children: React.ReactNode }>
  }
  enableRowSelection?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  pagination = true,
  className,
  rowClassName,
  onRowClick,
  components,
  enableRowSelection = true,
}: DataTableProps<TData, TValue>) {
  const { t, i18n } = useTranslation('common')
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection,
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
  })

  return (
    <div dir={i18n.dir()} className={cn("flex flex-col gap-4", className)}>
      {/* Search & Filters */}
      {typeof toolbar === 'function' ? toolbar(table) : toolbar}

      {/* Main Table View */}
      <div className="rounded-md border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const RowComponent = components?.row || TableRow
                  const rowContent = row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))

                  return (
                    <RowComponent
                      key={row.id}
                      row={row}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        onRowClick && "cursor-pointer",
                        rowClassName
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {rowContent}
                    </RowComponent>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t('table.no_results')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination Footer */}
      {pagination && <DataTablePagination table={table} />}
    </div>
  )
}

