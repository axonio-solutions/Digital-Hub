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
  pendingActionId?: string | null
}

function useBrandOptions(data: Array<any>) {
  return useMemo(() => {
    const brands = new Set<string>()
    data.forEach((r: any) => {
      const brandName = r.vehicleBrand || r.brand?.brand
      if (brandName) brands.add(brandName)
    })
    return Array.from(brands).sort().map((brand) => ({ label: brand, value: brand }))
  }, [data])
}

const GridCard = memo(function GridCard({ req, onAction, isProcessing }: {
  req: any
  onAction?: (action: { type: string, item: any }) => void
  isProcessing?: boolean
}) {
  const handleView = useCallback(() => onAction?.({ type: 'view_request', item: req }), [onAction, req.id])
  const handleEdit = useCallback(() => onAction?.({ type: 'edit_request', item: req }), [onAction, req.id])
  const handleClose = useCallback(() => onAction?.({ type: 'close_request', item: req }), [onAction, req.id])
  const handleReopen = useCallback(() => onAction?.({ type: 'reopen_request', item: req }), [onAction, req.id])
  const handleDelete = useCallback(() => onAction?.({ type: 'delete_request', item: req }), [onAction, req.id])

  return (
    <PartCard
      id={req.id}
      title={req.partName}
      brand={req.vehicleBrand || req.brand?.brand}
      brandImageUrl={req.brand?.imageUrl}
      modelYear={req.modelYear}
      category={req.category?.name}
      region={req.brand?.clusterRegion}
      imageUrls={req.imageUrls}
      quotesCount={req.quotes?.length}
      status={req.status}
      createdAt={req.createdAt}
      notes={req.notes}
      onClick={handleView}
      onEdit={req.status === 'open' ? handleEdit : undefined}
      onClose={req.status === 'open' ? handleClose : undefined}
      onReopen={req.status !== 'open' ? handleReopen : undefined}
      onDelete={req.status !== 'fulfilled' ? handleDelete : undefined}
      isProcessing={isProcessing}
      className="w-full"
    />
  )
})

export function BuyerGridView({ data, onAction, pendingActionId }: RequestsGridViewProps) {
  const { t } = useTranslation('requests/list')
  const columns = useBuyerColumns(onAction, undefined, t)
  const brandOptions = useBrandOptions(data)
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
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16 px-4">
        <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-inner">
          <Car className="size-10 text-primary/50" strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-black tracking-tight">{t('empty.title', 'No Demands Yet')}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t('empty.desc', 'Start posting your part requests to get offers from sellers')}
          </p>
        </div>
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
          <GridCard key={req.id} req={req} onAction={onAction} isProcessing={pendingActionId === req.id} />
        ))}
      </div>

      <DataTablePagination table={table} pageSizeOptions={[9, 18, 27, 36, 45, 54]} />
    </div>
  )
}
