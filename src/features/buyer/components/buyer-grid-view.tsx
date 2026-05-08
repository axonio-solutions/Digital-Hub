'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Car } from 'lucide-react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { IconCircleCheckFilled, IconCircleXFilled, IconLoader } from '@tabler/icons-react'
import { useBuyerColumns } from './buyer-columns'
import { PartCard } from '@/components/ui/part-card'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'

interface RequestsGridViewProps {
  data: Array<any>
  onAction?: (action: { type: string, item: any }) => void
}

const GridCard = memo(function GridCard({ req, t, onAction }: { req: any; t: any; onAction?: (action: { type: string, item: any }) => void }) {
  return (
    <PartCard
      id={req.id}
      title={req.partName}
      brand={req.vehicleBrand || req.brand?.brand}
      modelYear={req.modelYear}
      category={req.category?.name || t('empty.inquiry')}
      region={req.brand?.clusterRegion || t('empty.general')}
      imageUrls={req.imageUrls}
      quotesCount={req.quotes?.length}
      status={req.status}
      createdAt={req.createdAt}
      notes={req.notes}
      onClick={useCallback(() => onAction?.({ type: 'view_request', item: req }), [onAction, req.id])}
      onEdit={req.status === 'open' ? useCallback(() => onAction?.({ type: 'edit_request', item: req }), [onAction, req.id]) : undefined}
      onClose={req.status === 'open' ? useCallback(() => onAction?.({ type: 'close_request', item: req }), [onAction, req.id]) : undefined}
      onReopen={req.status !== 'open' ? useCallback(() => onAction?.({ type: 'reopen_request', item: req }), [onAction, req.id]) : undefined}
      onDelete={useCallback(() => onAction?.({ type: 'delete_request', item: req }), [onAction, req.id])}
      className="w-full"
    />
  )
})

export function BuyerGridView({ data, onAction }: RequestsGridViewProps) {
  const { t } = useTranslation('requests/list')
  const columns = useBuyerColumns(onAction)

  const brandOptions = useMemo(() => {
    const brands = new Set<string>()
    data.forEach((r: any) => {
      const brandName = r.vehicleBrand || r.brand?.brand
      if (brandName) brands.add(brandName)
    })
    return Array.from(brands)
      .sort()
      .map((brand) => ({ label: brand, value: brand }))
  }, [data])

  const [columnFilters, setColumnFilters] = useState<Array<any>>([])

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    initialState: { pagination: { pageSize: 9 } },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rows = table.getRowModel().rows.map((r) => r.original)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/5 border-muted-foreground/10">
        <Car className="size-12 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground">{t('empty.no_demands')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchColumn="partName"
        searchPlaceholder={t('filters.search_placeholder')}
        hideViewOptions
        facetedFilters={[
          {
            column: "status",
            title: t('filters.status'),
            options: [
              { label: t('filters.statuses.open'), value: "open", icon: IconLoader },
              { label: t('filters.statuses.fulfilled'), value: "fulfilled", icon: IconCircleCheckFilled },
              { label: t('filters.statuses.cancelled'), value: "cancelled", icon: IconCircleXFilled },
            ]
          },
          {
            column: "vehicleBrand",
            title: t('filters.brand'),
            options: brandOptions,
          }
        ]}
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((req: any) => (
          <GridCard key={req.id} req={req} t={t} onAction={onAction} />
        ))}
      </div>

      <DataTablePagination table={table} pageSizeOptions={[9, 18, 27, 36, 45, 54]} />
    </div>
  )
}
