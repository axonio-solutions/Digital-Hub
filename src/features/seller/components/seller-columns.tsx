'use client'

import { useMemo } from 'react'
import {
  MoreHorizontal,
  Eye,
  Settings2,
  Trash2,
  Calendar,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { formatRelativeTime } from '@/lib/utils/date-format'
import { useTranslation } from 'react-i18next'
import { tCategory } from '@/utils/category-utils'
import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { GlowingBadge } from "@/components/unlumen-ui/glowing-badge";
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const useSellerColumns = (
  onAction: (action: { type: string; item: any }) => void
): ColumnDef<any>[] => {
  const { t, i18n } = useTranslation('quotes')


  return useMemo(
    () => [
      {
        accessorKey: 'partName',
        header: t('columns.part'),
        cell: ({ row }) => {
          const quote = row.original
          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {quote.request?.partName}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                #{quote.id.substring(0, 8)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'vehicle',
        header: t('columns.vehicle'),
        cell: ({ row }) => {
          const request = row.original.request
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {request?.vehicleBrand} {request?.vehicleModel}
              </span>
              <Badge variant="outline" className="w-fit text-[10px] h-4 font-normal">
                {request?.modelYear}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: 'category',
        header: t('columns.category', { defaultValue: 'Category' }),
        cell: ({ row }) => {
          const category = row.original.request?.category?.name || row.original.request?.category
          return (
            <Badge variant="secondary" className="text-[10px]">
              {tCategory(category, t)}
            </Badge>
          )
        }
      },
      {
        accessorKey: 'price',
        header: t('columns.price'),
        cell: ({ row }) => {
          const price = row.original.price || 0
          const condition = row.original.condition
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-1 font-semibold">
                <span className="text-sm">
                  {price.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language)}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {t('columns.currency')}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {t(`columns.conditions.${condition}`, { defaultValue: condition })}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <GlowingBadge
              variant={
                status === 'accepted' ? 'success' :
                status === 'rejected' ? 'neutral' :
                'info'
              }
              pulse={status === 'pending'}
              className={cn(i18n.language === 'ar' ? '' : 'capitalize')}
            >
              {t(`columns.statuses.${status}`)}
            </GlowingBadge>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('columns.date'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">
              {formatRelativeTime(row.original.createdAt)}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const quote = row.original
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t('table.actions_menu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('table.actions_menu')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction({ type: 'view_request', item: quote })}>
                    <Eye className="me-2 h-4 w-4" />
                    {t('table.view_request')}
                  </DropdownMenuItem>
                  {quote.status === 'pending' && (
                    <DropdownMenuItem onClick={() => onAction({ type: 'update', item: quote })}>
                      <Settings2 className="me-2 h-4 w-4" />
                      {t('table.edit_offer')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onAction({ type: 'delete', item: quote })}
                    className="text-rose-600 focus:text-rose-600"
                  >
                    <Trash2 className="me-2 h-4 w-4" />
                    {t('table.withdraw_offer')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onAction, t]
  )
}
