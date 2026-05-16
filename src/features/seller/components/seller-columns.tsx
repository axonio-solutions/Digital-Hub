'use client'

import { useMemo } from 'react'
import { Calendar, Eye, MoreHorizontal, Settings2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { formatRelativeTime } from '@/lib/utils/date-format'
import { tCategory } from '@/utils/category-utils'
import { CategoryDisplay } from '@/components/ui/category-display'

import { Badge } from '@/components/ui/badge'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const BRAND_COLORS: Record<string, string> = {
  BMW: '#1a6eb5',
  Mercedes: '#1a1a1a',
  'Mercedes-Benz': '#1a1a1a',
  Audi: '#bb161b',
  Volkswagen: '#1d5ba4',
  Toyota: '#e10a1a',
  Honda: '#0065b3',
  Ford: '#003478',
  Hyundai: '#002d6e',
  Kia: '#bb162b',
  Renault: '#ffcc00',
  Peugeot: '#003a8c',
  Citroën: '#da291c',
  Citroen: '#da291c',
  Fiat: '#960018',
  Nissan: '#c3002f',
  Dacia: '#647687',
  'Land Rover': '#003d2e',
  Jaguar: '#222222',
  Porsche: '#b12b2b',
  Ferrari: '#ff2800',
  Lamborghini: '#eaba14',
  Volvo: '#003057',
  Mazda: '#990000',
  Subaru: '#013c73',
  Suzuki: '#c70a19',
  MINI: '#004a8f',
  Mini: '#004a8f',
  Jeep: '#104e8b',
  Tesla: '#e82127',
  Opel: '#006db3',
  SEAT: '#e0101a',
  Seat: '#e0101a',
  Škoda: '#00694d',
  Skoda: '#00694d',
  Bentley: '#006c3b',
  Maserati: '#00366b',
  'Alfa Romeo': '#003366',
  AlfaRomeo: '#003366',
  Chevrolet: '#003366',
  Dodge: '#333333',
  Chrysler: '#333333',
  Cadillac: '#333333',
  Lexus: '#333333',
  Mitsubishi: '#c70a19',
  Tata: '#003d6b',
  MG: '#c93c20',
  BYD: '#e02b20',
  Polestar: '#181818',
  Genesis: '#e8340b',
  Infiniti: '#004080',
  Acura: '#e7192b',
  smart: '#000000',
  Lancia: '#0060a8',
  Cupra: '#003648',
  Alpine: '#0046ad',
  Abarth: '#bc171d',
  Iveco: '#005bac',
  MAN: '#9b0f16',
  Scania: '#005bac',
  Daihatsu: '#ce182c',
  Isuzu: '#e1000f',
  GMC: '#b82b2e',
  Buick: '#003366',
  Ram: '#111111',
  'Aston Martin': '#003d2e',
  McLaren: '#f9862a',
  Bugatti: '#003366',
  Koenigsegg: '#1b1b1b',
  Pagani: '#ccc8ad',
}

function getBrandColor(brand?: string): string {
  if (!brand) return '#888'
  return BRAND_COLORS[brand] || `hsl(${brand.length * 47 + brand.charCodeAt(0) * 13 % 360}, 55%, 45%)`
}

export const useSellerColumns = (
  onAction: (action: { type: string; item: any }) => void,
  brandLogos?: Record<string, string>,
): Array<ColumnDef<any>> => {
  const { t, i18n } = useTranslation('quotes')

  return useMemo(
    () => [
      {
        accessorKey: 'partName',
        header: t('columns.part'),
        cell: ({ row }) => {
          const quote = row.original
          const partImages = quote.request?.imageUrls || []
          return (
            <div className="flex items-center gap-3">
              <div className="size-8 rounded bg-muted overflow-hidden border shrink-0 flex items-center justify-center">
                {partImages.length > 0 ? (
                  <img src={partImages[0]} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground font-bold">
                    {quote.request?.partName?.substring(0, 2).toUpperCase() || 'P'}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate max-w-[180px]" title={quote.request?.partName}>
                  {quote.request?.partName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  #{quote.id.substring(0, 8)}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'vehicle',
        header: t('columns.vehicle'),
        cell: ({ row }) => {
          const request = row.original.request
          const brand = request?.vehicleBrand || ''
          const model = request?.vehicleModel || ''
          const year = request?.modelYear
          const logoUrl = brandLogos?.[brand]
          return (
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                {logoUrl ? (
                  <img src={logoUrl} alt={brand} className="size-4 object-contain" />
                ) : (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {(brand || '?').substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium">{brand} {model}</span>
                {year && <span className="text-xs text-muted-foreground">{year}</span>}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'category',
        header: t('columns.category', { defaultValue: 'Category' }),
        cell: ({ row }) => {
          const cat = row.original.request?.category
          const catName = cat?.name || row.original.request?.category || ''
          return (
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                {cat?.imageUrl ? (
                  <img src={cat.imageUrl} alt="" className="size-4 object-contain" />
                ) : (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {(catName || '?').substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{tCategory(catName, t)}</span>
            </div>
          )
        },
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
                <span className="text-sm">{price.toLocaleString(i18n.language)}</span>
                <span className="text-[10px] text-muted-foreground uppercase">DZD</span>
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
                status === 'accepted'
                  ? 'success'
                  : status === 'rejected' || status === 'withdrawn'
                    ? 'neutral'
                    : 'info'
              }
              pulse={status === 'pending'}
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
            <span className="text-xs">{formatRelativeTime(row.original.createdAt)}</span>
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
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
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
                  {(quote.status === 'pending' || quote.status === 'rejected') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onAction({ type: 'delete', item: quote })}
                        className="text-rose-600 focus:text-rose-600"
                      >
                        <Trash2 className="me-2 h-4 w-4" />
                        {t('table.withdraw_offer')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onAction, t, i18n.language, brandLogos],
  )
}
