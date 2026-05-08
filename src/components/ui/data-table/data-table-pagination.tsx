import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: Array<number>
}

const DEFAULT_PAGE_SIZES = [10, 20, 25, 30, 40, 50]

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
}: DataTablePaginationProps<TData>) {
  const { t, i18n } = useTranslation('common')
  const isRtl = i18n.dir() === 'rtl'
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()
  const canPrev = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-2">

      {/* Row selection count — hidden on mobile */}
      <div className="hidden md:block text-muted-foreground text-sm flex-1">
        {table.getFilteredSelectedRowModel().rows.length}{' '}
        {t('pagination.of')}{' '}
        {table.getFilteredRowModel().rows.length}{' '}
        {t('pagination.selected')}
      </div>

      {/* Info row: rows selector + page indicator */}
      <div className="flex items-center justify-between md:justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            {t('pagination.rows_per_page')}
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-9 w-[70px] rounded-xl text-sm">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm font-medium text-muted-foreground tabular-nums whitespace-nowrap">
          {t('pagination.page')} {pageIndex + 1}{' '}
          <span className="text-muted-foreground/60">{t('pagination.of')} {pageCount}</span>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-1.5">

        {/* First page — desktop only */}
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 lg:flex rounded-lg"
          onClick={() => table.setPageIndex(0)}
          disabled={!canPrev}
        >
          <span className="sr-only">{t('pagination.first')}</span>
          {isRtl ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl font-medium",
            "md:size-8 md:p-0 md:justify-center",
            "h-12 flex-1 text-sm justify-center"
          )}
          onClick={() => table.previousPage()}
          disabled={!canPrev}
        >
          {isRtl ? <ChevronRight className="size-5 md:size-4" /> : <ChevronLeft className="size-5 md:size-4" />}
          <span className="md:hidden">{t('pagination.previous')}</span>
        </Button>

        {/* Next */}
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl font-medium",
            "md:size-8 md:p-0 md:justify-center",
            "h-12 flex-1 text-sm justify-center"
          )}
          onClick={() => table.nextPage()}
          disabled={!canNext}
        >
          <span className="md:hidden">{t('pagination.next')}</span>
          {isRtl ? <ChevronLeft className="size-5 md:size-4" /> : <ChevronRight className="size-5 md:size-4" />}
        </Button>

        {/* Last page — desktop only */}
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 lg:flex rounded-lg"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNext}
        >
          <span className="sr-only">{t('pagination.last')}</span>
          {isRtl ? <ChevronsLeft className="size-4" /> : <ChevronsRight className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
