import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSellerColumns } from './seller-columns'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'

interface SellerQuotesTableProps {
  data: Array<any>
  onAction: (action: { type: string; item: any }) => void
  toolbarExtras?: React.ReactNode
}

export function SellerQuotesTable({ data, onAction, toolbarExtras }: SellerQuotesTableProps) {
  const { t } = useTranslation('quotes')
  const columns = useSellerColumns(onAction)

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
