'use client'

import { X } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FacetedFilterConfig {
  column: string
  title: string
  options: Array<{
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }>
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  facetedFilters?: FacetedFilterConfig[]
  children?: React.ReactNode
  className?: string
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = 'Filter...',
  facetedFilters = [],
  children,
  className,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation('common')
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-1 items-center gap-2">
        {searchColumn && table.getColumn(searchColumn) && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}

        {facetedFilters.map((config) => (
          table.getColumn(config.column) && (
            <DataTableFacetedFilter
              key={config.column}
              column={table.getColumn(config.column)}
              title={config.title}
              options={config.options}
            />
          )
        ))}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('table.reset')}
            <X className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

