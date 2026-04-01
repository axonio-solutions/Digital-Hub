'use client'

import { useMemo } from 'react'
import {
  ColumnDef,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Eye,
  MoreHorizontal,
  Send,
  Pencil,
  FileText,
  Trash2,
  CarFront,
  Layers,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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
  return (
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

        {type === 'opportunity' ? (
          <>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'send_offer', item })}
            >
              <Send className="mr-2 h-4 w-4" /> Send Offer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'view_request', item })}
            >
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'view_offer', item })}
            >
              <FileText className="mr-2 h-4 w-4" /> View Offer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'update', item })}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Quote
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction?.({ type: 'delete', item })}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Withdraw
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
        label: cat,
        value: cat,
        icon: Layers,
      }))
  }, [data])

  const columns = useMemo<Array<ColumnDef<any>>>(
    () => [
      {
        accessorKey: 'partName',
        header: 'Part',
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
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {row.original.partName}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  ID: {row.original.id.substring(0, 8)}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'vehicleBrand',
        header: 'Vehicle',
        cell: ({ row }) => {
          const brand = row.original.vehicleBrand || row.original.brand?.brand
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {brand} {row.original.vehicleModel || ''}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.modelYear} • {row.original.brand?.clusterRegion || 'General'}
              </span>
            </div>
          )
        }
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const category = row.original.category?.name || row.original.category || 'Part'
          return (
            <Badge variant="secondary" className="capitalize">
              {category}
            </Badge>
          )
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Posted',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3" />
            <span className="text-xs">
              {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
            </span>
          </div>
        )
      },
      ...(type === 'active' ? [
        {
          accessorKey: 'quoteStatus',
          header: 'My Offer',
          cell: ({ row }: { row: any }) => (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold">
                {row.original.quotePrice.toLocaleString()} <span className="text-[10px] font-normal">DZD</span>
              </span>
              <Badge
                variant={row.original.quoteStatus === 'accepted' ? 'default' : 'outline'}
                className="w-fit text-[10px] capitalize"
              >
                {row.original.quoteStatus}
              </Badge>
            </div>
          )
        }
      ] : []),
      {
        id: 'actions',
        header: '',
        cell: ({ row }: { row: any }) => (
          <div className="flex justify-end">
            <ActionCell
              item={row.original}
              onAction={onAction}
              type={type}
            />
          </div>
        )
      }
    ],
    [type, onAction]
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
          searchPlaceholder="Search parts, vehicles..."
          facetedFilters={[
            {
              column: 'vehicleBrand',
              title: 'Brands',
              options: brandOptions,
            },
            {
              column: 'category',
              title: 'Categories',
              options: categoryOptions,
            },
          ]}
        />
      )}
    />
  )
}
