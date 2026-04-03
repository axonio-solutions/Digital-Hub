'use client'

import {
  IconCircleCheckFilled,
  IconLoader,
  IconCircleXFilled,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { useSellerColumns } from './seller-columns'

interface SellerQuotesTableProps {
  data: Array<any>
  onAction: (action: { type: string, item: any }) => void
}

export function SellerQuotesTable({ data, onAction }: SellerQuotesTableProps) {
  const { t } = useTranslation('quotes')
  const columns = useSellerColumns(onAction)

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
            searchPlaceholder={t('table.search_placeholder')}
            facetedFilters={[
              {
                column: "status",
                title: t('table.status_filter'),
                options: [
                  { label: t('columns.statuses.accepted'), value: "accepted", icon: IconCircleCheckFilled },
                  { label: t('columns.statuses.pending'),  value: "pending",  icon: IconLoader },
                  { label: t('columns.statuses.rejected'), value: "rejected", icon: IconCircleXFilled },
                ]
              }
            ]}
          />
        )}
      />
    </div>
  )
}
