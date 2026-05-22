import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSellerColumns } from './seller-columns'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'

interface SellerQuotesTableProps {
  data: Array<any>
  onAction: (action: { type: string; item: any }) => void
  brandLogos?: Record<string, string>
  toolbarExtras?: React.ReactNode
}

export function SellerQuotesTable({
  data,
  onAction,
  brandLogos,
  toolbarExtras,
}: SellerQuotesTableProps) {
  const { t } = useTranslation('quotes')
  const columns = useSellerColumns(onAction, brandLogos)

  return (
    <DataTable
      data={data}
      columns={columns}
      onRowClick={(item) => onAction({ type: 'view_request', item })}
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchColumn="partName"
          searchPlaceholder={t('table.search_placeholder')}
        >
          {toolbarExtras}
        </DataTableToolbar>
      )}
    />
  )
}
