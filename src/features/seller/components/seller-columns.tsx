'use client'

import {
  MoreHorizontal,
  Eye,
  Settings2,
  Trash2,
  Calendar,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'

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

export const sellerColumns = (onAction: (action: { type: string, item: any }) => void): ColumnDef<any>[] => [
  {
    accessorKey: 'partName',
    header: 'Part Name',
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
    header: 'Vehicle',
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
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-1 font-semibold">
           <span className="text-sm">{(row.original.price || 0).toLocaleString()}</span>
           <span className="text-[10px] text-muted-foreground">DZD</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
           {row.original.condition}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant={
            status === 'accepted' ? 'default' :
            status === 'rejected' ? 'destructive' :
            'secondary'
          }
          className="capitalize"
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span className="text-xs">
          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
        </span>
      </div>
    )
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction({ type: 'view_request', item: quote })}>
                <Eye className="mr-2 h-4 w-4" />
                View Request
              </DropdownMenuItem>
              {quote.status === 'pending' && (
                <DropdownMenuItem onClick={() => onAction({ type: 'update', item: quote })}>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Edit Offer
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onAction({ type: 'delete', item: quote })} 
                className="text-rose-600 focus:text-rose-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Withdraw Offer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

