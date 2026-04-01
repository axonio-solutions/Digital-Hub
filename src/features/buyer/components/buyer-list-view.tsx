'use client'

import { useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { buyerColumns } from './buyer-columns'
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
  const columns = useMemo(() => buyerColumns(onAction), [onAction])

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
            searchPlaceholder="Filter demands..."
            facetedFilters={[
              {
                column: "status",
                title: "Status",
                options: [
                  { label: "Open", value: "open", icon: IconLoader },
                  { label: "Fulfilled", value: "fulfilled", icon: IconCircleCheckFilled },
                  { label: "Cancelled", value: "cancelled", icon: IconCircleXFilled },
                ]
              },
              {
                column: "vehicleBrand",
                title: "Brand",
                options: brandOptions,
              }
            ]}
          />
        )}
      />
    </div>
  )
}
