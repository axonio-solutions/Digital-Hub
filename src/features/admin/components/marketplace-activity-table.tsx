'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { marketplaceColumns } from './marketplace-columns'
import type { MarketplaceActivity } from './marketplace-columns'

import { DataTable } from '@/components/ui/data-table/data-table'

export function MarketplaceActivityTable({
  data,
}: {
  data: Array<MarketplaceActivity>
}) {
  const { t } = useTranslation('dashboard/admin')
  const columns = React.useMemo(() => marketplaceColumns(t), [t])

  return (
    <div className="rounded-xl border bg-card/30 backdrop-blur-sm overflow-hidden">
      <DataTable data={data} columns={columns} enableRowSelection={false} />
    </div>
  )
}
