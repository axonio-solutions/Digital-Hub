'use client'

import { useState } from 'react'
import { Columns2, Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import type { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
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
  facetedFilters?: Array<FacetedFilterConfig>
  children?: React.ReactNode
  className?: string
  hideViewOptions?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder: _searchPlaceholder,
  facetedFilters = [],
  children,
  className,
  hideViewOptions,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation('common')
  const searchPlaceholder = _searchPlaceholder ?? t('table.search')
  const isFiltered = table.getState().columnFilters.length > 0
  const activeCount = table.getState().columnFilters.reduce((sum, f) => {
    const v = f.value as Array<any>
    return sum + (Array.isArray(v) ? v.length : 0)
  }, 0)
  const [searchFocused, setSearchFocused] = useState(false)

  const hasSearch = !!(searchColumn && table.getColumn(searchColumn))
  const availableFilters = facetedFilters.filter((f) =>
    table.getColumn(f.column),
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-2 md:flex-row md:items-center md:gap-3',
        className,
      )}
    >
      <div className="flex items-center gap-2 w-full md:flex-1 md:min-w-0">
        {hasSearch && (
          <div className="relative flex-1 min-w-0 md:max-w-[320px]">
            <Search
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none',
                searchFocused ? 'text-primary' : 'text-muted-foreground/60',
              )}
            />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchColumn)?.getFilterValue() as string) ||
                ''
              }
              onChange={(e) =>
                table.getColumn(searchColumn)?.setFilterValue(e.target.value)
              }
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                'h-10 pl-9 pr-3 rounded-xl text-sm w-full border-0 bg-muted/50',
                'placeholder:text-muted-foreground/50',
                'md:w-full md:bg-transparent md:border',
                'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:bg-background focus-visible:border-primary/30',
              )}
            />
          </div>
        )}

        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          {availableFilters.length > 0 && (
            <Drawer shouldScaleBackground={false}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-1.5 rounded-xl border-border/60 bg-card text-sm font-medium"
                >
                  <SlidersHorizontal className="size-3.5" />
                  {activeCount > 0 && (
                    <Badge className="h-5 min-w-5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {activeCount}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent
                className="flex flex-col"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              >
                <DrawerHeader className="text-left pb-2">
                  <DrawerTitle>{t('table.filters', 'Filters')}</DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-5">
                  {availableFilters.map(
                    (config) =>
                      table.getColumn(config.column) && (
                        <div key={config.column} className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground pl-1">
                            {config.title}
                          </p>
                          <DataTableFacetedFilter
                            column={table.getColumn(config.column)}
                            title={config.title}
                            options={config.options}
                          />
                        </div>
                      ),
                  )}
                </div>
                {isFiltered && (
                  <div className="px-4 pt-2 pb-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => table.resetColumnFilters()}
                      className="h-10 w-full rounded-xl gap-2"
                    >
                      <X className="size-4" />
                      {t('table.reset')}
                    </Button>
                  </div>
                )}
              </DrawerContent>
            </Drawer>
          )}

          {!hideViewOptions && (
            <Drawer shouldScaleBackground={false}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-border/60 bg-card shrink-0"
                >
                  <Columns2 className="size-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent
                className="flex flex-col"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              >
                <DrawerHeader className="text-left pb-2">
                  <DrawerTitle>
                    {t('table.toggle_columns', 'Columns')}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto px-4 pb-3 flex flex-col gap-0.5">
                  {table
                    .getAllColumns()
                    .filter(
                      (c) =>
                        typeof c.accessorFn !== 'undefined' && c.getCanHide(),
                    )
                    .map((column) => (
                      <Button
                        key={column.id}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          column.toggleVisibility(!column.getIsVisible())
                        }
                        className="h-11 justify-start gap-3 rounded-xl font-medium text-sm w-full"
                      >
                        <span
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-md border shadow-sm shrink-0',
                            column.getIsVisible()
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'bg-muted border-border',
                          )}
                        >
                          {column.getIsVisible() && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2.5 6L5 8.5L9.5 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="capitalize">{column.id}</span>
                      </Button>
                    ))}
                </div>
              </DrawerContent>
            </Drawer>
          )}

          {children}
        </div>
      </div>

      <div className="hidden md:flex md:items-center md:gap-2 overflow-hidden">
        {availableFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {availableFilters.map(
              (config) =>
                table.getColumn(config.column) && (
                  <DataTableFacetedFilter
                    key={config.column}
                    column={table.getColumn(config.column)}
                    title={config.title}
                    options={config.options}
                  />
                ),
            )}
          </div>
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent gap-1.5 animate-in fade-in"
          >
            <X className="size-3.5" />
            <span className="text-xs font-medium">{t('table.reset')}</span>
          </Button>
        )}

        {children}
        {!hideViewOptions && <DataTableViewOptions table={table} />}
      </div>
    </div>
  )
}
