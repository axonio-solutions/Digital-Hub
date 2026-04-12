'use client'

import { useMemo } from 'react'
import {
  CarFront,
  Clock,
  Eye,
  FileText,
  Layers,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { arDZ, enUS, fr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import type {
  ColumnDef,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { tCategory } from '@/utils/category-utils'
import { cn } from '@/lib/utils'

const dateLocaleMap: Record<string, any> = {
  ar: arDZ,
  fr: fr,
  en: enUS,
}

interface MarketplaceDataTableProps {
  data: Array<any>
  onAction?: (action: { type: 'view_request' | 'view_offer' | 'update' | 'delete' | 'send_offer', item: any }) => void
  type: 'opportunity' | 'active'
}

const ActionCell = ({
  item,
  onAction,
  type
}: {
  item: any,
  onAction?: (action: any) => void,
  type: 'opportunity' | 'active'
}) => {
  const { t } = useTranslation('marketplace')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{t('table.actions.label')}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('table.actions.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {type === 'opportunity' ? (
          <>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'send_offer', item })}
            >
              <Send className="me-2 h-4 w-4" /> {t('table.actions.send_offer')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'view_request', item })}
            >
              <Eye className="me-2 h-4 w-4" /> {t('table.actions.view_details')}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'view_offer', item })}
            >
              <FileText className="me-2 h-4 w-4" /> {t('table.actions.view_offer')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'update', item })}
            >
              <Pencil className="me-2 h-4 w-4" /> {t('table.actions.edit_quote')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'delete', item })}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="me-2 h-4 w-4" /> {t('table.actions.withdraw')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MarketplaceDataTable({
  data,
  onAction,
  type,
}: MarketplaceDataTableProps) {
  const { t, i18n } = useTranslation('marketplace')
  const currentLocale = dateLocaleMap[i18n.language] || enUS

  // Extract unique brands for filtering
  const brandOptions = useMemo(() => {
    const brands = new Set<string>()
    data.forEach((item) => {
      const brand = item.vehicleBrand || item.brand?.brand
      if (brand) brands.add(brand)
    })
    return Array.from(brands)
      .sort()
      .map((brand) => ({
        label: brand,
        value: brand,
        icon: CarFront,
      }))
  }, [data])

  // Extract unique categories for filtering
  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    data.forEach((item) => {
      const category = item.category?.name || item.category
      if (category) categories.add(category)
    })
    return Array.from(categories)
      .sort()
      .map((cat) => ({
        label: tCategory(cat, t),
        value: cat,
        icon: Layers,
      }))
  }, [data])

  const columns = useMemo<Array<ColumnDef<any>>>(
    () => [
      {
        accessorKey: 'partName',
        header: t('table.headers.part'),
        cell: ({ row }) => {
          const images = row.original.imageUrls || []
          return (
            <div className="flex items-center gap-3">
              <div className="size-8 rounded bg-muted overflow-hidden border">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={row.original.partName}
                    className="object-cover size-full"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                    {row.original.partName?.substring(0, 2).toUpperCase() || 'P'}
                  </div>
                )}
              </div>
              <div className={cn(
                "flex flex-col w-full",
                i18n.dir() === 'rtl' ? "items-start text-right" : "items-start text-left"
              )}>
                <span className="font-medium text-sm w-fit" dir="auto">
                  {row.original.partName}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase w-fit" dir="auto">
                  {t('table.defaults.id_prefix')} {row.original.id.substring(0, 8)}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'vehicleBrand',
        header: t('table.headers.vehicle'),
        cell: ({ row }) => {
          return (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white">
                {row.original.vehicleBrand}
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                {row.original.modelYear}
              </span>
            </div>
          )
        }
      },
      {
        accessorKey: 'category',
        header: t('table.headers.category'),
        cell: ({ row }) => {
          const category = row.original.category?.name || row.original.category 
          return (
            <Badge variant="secondary">
              {tCategory(category, t)}
            </Badge>
          )
        }
      },
      {
        accessorKey: 'createdAt',
        header: t('table.headers.posted'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3" />
            <span className="text-xs">
              {formatDistanceToNow(new Date(row.original.createdAt), { 
                addSuffix: true,
                locale: currentLocale 
              })}
            </span>
          </div>
        )
      },
      ...(type === 'active' ? [
        {
          accessorKey: 'quoteStatus',
          header: t('table.headers.my_offer'),
          cell: ({ row }: { row: any }) => (
            <div className={cn(
              "flex flex-col gap-1 w-full",
              i18n.dir() === 'rtl' ? "items-start text-right" : "items-start text-left"
            )}>
              <span className="text-sm font-bold w-fit">
                {new Intl.NumberFormat(i18n.language).format(row.original.quotePrice)}{' '}
                <span className="text-[10px] font-normal uppercase">
                  {t('table.defaults.currency')}
                </span>
              </span>
              <Badge
                variant={row.original.quoteStatus === 'accepted' ? 'default' : 'outline'}
                className="w-fit text-[10px]"
              >
                {t(`statuses.${row.original.quoteStatus}`)}
              </Badge>
            </div>
          )
        }
      ] : []),
      {
        id: 'actions',
        header: '',
        cell: ({ row }: { row: any }) => (
          <div className="flex justify-end rtl:justify-start">
            <ActionCell
              item={row.original}
              onAction={onAction}
              type={type}
            />
          </div>
        )
      }
    ],
    [type, onAction, t, i18n.language, currentLocale]
  )

  return (
    <DataTable
      data={data}
      columns={columns}
      onRowClick={(item) => {
        // Always open the full request details (car modal) on row click for maximum context
        onAction?.({ type: 'view_request', item })
      }}
      toolbar={(table: any) => (
        <DataTableToolbar
          table={table}
          searchColumn="partName"
          searchPlaceholder={t('table.search_placeholder')}
          facetedFilters={[
            {
              column: 'vehicleBrand',
              title: t('table.brand_filter'),
              options: brandOptions,
            },
            {
              column: 'category',
              title: t('table.headers.category'),
              options: categoryOptions,
            },
          ]}
        />
      )}
    />
  )
}
