'use client'

import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { formatRelativeTime } from '@/lib/utils/date-format'
import { Badge } from '@/components/ui/badge'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const marketplaceActivitySchema = z.object({
  id: z.string(),
  partName: z.string(),
  buyer: z.string(),
  brand: z.string(),
  year: z.string(),
  status: z.string(),
  offers: z.number(),
  createdAt: z.string(),
  image: z.string().optional(),
})

export type MarketplaceActivity = z.infer<typeof marketplaceActivitySchema>

export const marketplaceColumns = (
  t: (key: string) => string,
): Array<ColumnDef<MarketplaceActivity>> => [
  {
    accessorKey: 'partName',
    header: t('table.columns.part_name'),
    cell: ({ row }) => {
      const mainImage = row.original.image
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden shrink-0">
            <AvatarImage src={mainImage} className="object-cover" />
            <AvatarFallback className="bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-300 font-bold text-xs rounded-none">
              {row.original.partName?.substring(0, 2).toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground truncate max-w-[180px]">
              {row.original.partName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">
              ID: {row.original.id?.substring(0, 12)}
            </span>
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'brand',
    header: t('table.vehicle'),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {row.original.brand}
        </Badge>
        <span className="text-muted-foreground text-xs">
          {row.original.year}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: t('table.status_placeholder'),
    cell: ({ row }) => {
      const status = row.original.status as 'fulfilled' | 'open' | 'cancelled'
      return (
        <GlowingBadge
          variant={status === 'fulfilled' ? 'success' : 'info'}
          pulse={status === 'open'}
          className="capitalize text-[10px]"
        >
          {t(`table.status.${status}`)}
        </GlowingBadge>
      )
    },
  },
  {
    accessorKey: 'buyer',
    header: t('table.buyer'),
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {row.original.buyer}
      </span>
    ),
  },
  {
    accessorKey: 'offers',
    header: t('metrics.avg_offers'),
    cell: ({ row }) => (
      <div className="text-center w-12 font-mono text-sm font-bold tabular-nums">
        {row.original.offers}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: t('table.columns.created_at'),
    cell: ({ row }) => (
      <div className="text-muted-foreground text-xs">
        {formatRelativeTime(row.original.createdAt)}
      </div>
    ),
  },
]
