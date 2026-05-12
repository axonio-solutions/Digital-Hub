'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconLoader
} from '@tabler/icons-react'
import { useBuyerColumns } from './buyer-columns'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { useCancelRequest, useDeleteRequest, useReopenRequest } from '@/features/requests/hooks/use-requests'

interface RequestsListViewProps {
  data: Array<any>
  onAction?: (action: { type: string, item: any }) => void
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

export function BuyerListView({ data, onAction }: RequestsListViewProps) {
  const { t } = useTranslation('requests/list')
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelRequest()
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest()
  const { mutate: reopenRequest, isPending: isReopening } = useReopenRequest()

  const columns = useBuyerColumns(
    onAction,
    { cancelRequest, deleteRequest, reopenRequest, isCancelling, isDeleting, isReopening },
    t,
  )

  const brandOptions = useBrandOptions(data)

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      <DataTable
        data={data}
        columns={columns}
        onRowClick={(item) => onAction?.({ type: 'view_request', item })}
        toolbar={(table) => (
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
                  { label: t('filters.statuses.open'), value: 'open', icon: IconLoader },
                  { label: t('filters.statuses.fulfilled'), value: 'fulfilled', icon: IconCircleCheckFilled },
                  { label: t('filters.statuses.cancelled'), value: 'cancelled', icon: IconCircleXFilled },
                ],
              },
              {
                column: 'vehicleBrand',
                title: t('filters.brand'),
                options: brandOptions,
              },
            ]}
          />
        )}
      />
    </div>
  )
}
