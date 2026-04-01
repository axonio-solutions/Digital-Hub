'use client'

import { useMemo } from 'react'
import {
  IconCircleCheckFilled,
  IconLoader,
  IconCircleXFilled,
} from '@tabler/icons-react'

import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { sellerColumns } from './seller-columns'

interface SellerQuotesTableProps {
  data: Array<any>
  onAction: (action: { type: string, item: any }) => void
}

export function SellerQuotesTable({ data, onAction }: SellerQuotesTableProps) {
  const columns = useMemo(() => sellerColumns(onAction), [onAction])

  return (
    <div className="space-y-6">
      <DataTable
        data={data}
        columns={columns}
        onRowClick={(item) => onAction({ type: 'view_request', item })}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="partName"
            searchPlaceholder="Search proposals..."
            facetedFilters={[
              {
                column: "status",
                title: "Status",
                options: [
                  { label: "Accepted", value: "accepted", icon: IconCircleCheckFilled },
                  { label: "Pending", value: "pending", icon: IconLoader },
                  { label: "Rejected", value: "rejected", icon: IconCircleXFilled },
                ]
              }
            ]}
          />
        )}
      />
    </div>
  )
}
