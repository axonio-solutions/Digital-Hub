'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { useBuyerColumns } from './buyer-columns'
import { 
  IconCircleCheckFilled, 
  IconLoader,
  IconCircleXFilled 
} from '@tabler/icons-react'

interface RequestsListViewProps {
  data: Array<any>
  onAction?: (action: { type: string, item: any }) => void
}

export function BuyerListView({ data, onAction }: RequestsListViewProps) {
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
      .map((brand) => ({
        label: brand,
        value: brand,
      }))
  }, [data])

  return (
    <div className="space-y-4">
      <DataTable
        data={data}
        columns={columns}
        onRowClick={(item) => onAction?.({ type: 'view_request', item })}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="partName"
            searchPlaceholder={t('filters.search_placeholder')}
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
        )}
      />
    </div>
  )
}
