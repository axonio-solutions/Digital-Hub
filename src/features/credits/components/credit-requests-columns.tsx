'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Check, Coins, X } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { useToast } from '@/hooks/use-toast'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'

export const useCreditRequestsColumns = (
  approve: (
    data: { id: string },
    options?: { onSuccess?: () => void; onError?: (err: any) => void },
  ) => void,
  reject: (
    data: { id: string; adminNote?: string },
    options?: { onSuccess?: () => void; onError?: (err: any) => void },
  ) => void,
  isApproving: boolean,
  isRejecting: boolean,
): Array<ColumnDef<any>> => {
  const { t } = useTranslation('dashboard/credits')
  const { toast } = useToast('dashboard/credits')

  return [
    {
      accessorKey: 'seller',
      header: t('credit_requests.columns.seller'),
      cell: ({ row }: { row: any }) => {
        const seller = row.original.seller
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8 rounded-xl shrink-0">
              <AvatarFallback className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                {seller?.name?.substring(0, 2).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">
                {seller?.name || t('credit_requests.unknown_seller')}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {seller?.storeName || seller?.email || ''}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'credits',
      header: t('credit_requests.columns.credits'),
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-1.5">
          <Coins className="size-3.5 text-amber-500 shrink-0" />
          <span className="text-sm font-bold tabular-nums">
            {row.original.credits}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'package',
      header: t('credit_requests.columns.package'),
      cell: ({ row }: { row: any }) => {
        const pkg = row.original.package
        return (
          <span className="text-sm text-muted-foreground">
            {pkg?.name || '\u2014'}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('credit_requests.columns.status'),
      cell: ({ row }: { row: any }) => {
        const status = row.original.status
        return (
          <GlowingBadge
            variant={
              status === 'pending'
                ? 'warning'
                : status === 'approved'
                  ? 'success'
                  : 'error'
            }
            className="text-[9px] uppercase"
          >
            {t(`credit_requests.filter_${status}` as any)}
          </GlowingBadge>
        )
      },
      filterFn: (row: any, id: string, value: any) =>
        value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'createdAt',
      header: t('credit_requests.columns.date'),
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="size-3 shrink-0" />
          <span className="text-xs whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('credit_requests.columns.actions'),
      cell: ({ row }: { row: any }) => {
        const req = row.original
        const [showReject, setShowReject] = useState(false)
        const [note, setNote] = useState('')

        if (req.status !== 'pending')
          return <span className="text-xs text-muted-foreground">\u2014</span>

        return (
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              disabled={isApproving}
              size="sm"
              onClick={() => {
                approve({ id: req.id }, {
                  onSuccess: () => {
                    toast.success('credit_requests.grant_success', {
                      values: { credits: req.credits, name: req.seller?.name },
                    })
                  },
                  onError: (err: any) =>
                    toast.error('credit_requests.error', {
                      error: err.message,
                    }),
                } as any)
              }}
              className="h-7 text-[10px] font-bold px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="size-3 mr-0.5" />{' '}
              {t('credit_requests.approve_grant')}
            </Button>
            {showReject ? (
              <div className="flex items-center gap-1">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('credit_requests.reject_reason_placeholder')}
                  className="h-7 min-h-0 text-[10px] rounded-lg py-0.5 px-1.5 w-24"
                />
                <Button
                  disabled={isRejecting}
                  size="sm"
                  onClick={() => {
                    reject({ id: req.id, adminNote: note || undefined }, {
                      onSuccess: () => {
                        setShowReject(false)
                        setNote('')
                        toast.success('credit_requests.reject_success')
                      },
                      onError: (err: any) =>
                        toast.error('credit_requests.error', {
                          error: err.message,
                        }),
                    } as any)
                  }}
                  className="h-7 text-[10px] font-bold px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  {t('credit_requests.reject_action')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReject(false)}
                  className="h-7 text-[10px] px-1"
                >
                  {t('packages.form.cancel')}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReject(true)}
                className="h-7 text-[10px] font-bold px-2 rounded-lg"
              >
                <X className="size-3 mr-0.5" />{' '}
                {t('credit_requests.reject_action')}
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}
