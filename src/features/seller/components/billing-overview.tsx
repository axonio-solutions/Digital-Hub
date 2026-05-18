'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSellerCreditBalance } from '../hooks/use-billing'
import { DirectionProvider } from '@/components/ui/direction'
import { Skeleton } from '@/components/ui/skeleton'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RequestCreditsDialog } from '@/features/credits/components/request-credits-dialog'
import {
  Coins,
  Send,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'

const DATE_LOCALE: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-DZ',
}

export function BillingOverview() {
  const { t, i18n } = useTranslation()
  const locale = DATE_LOCALE[i18n.language] || 'en-US'
  const { data, isLoading } = useSellerCreditBalance()
  const dir = i18n.dir()
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const tc = (key: string) => t(`dashboard/credits:${key}`)

  const balance = data?.balance ?? 0
  const transactions = data?.transactions ?? []

  const { totalSpent, totalPurchased, quoteCount } = useMemo(() => {
    let spent = 0, purchased = 0, quotes = 0
    for (const txn of transactions) {
      if (txn.amount < 0) spent += Math.abs(txn.amount)
      else purchased += txn.amount
      if (txn.type === 'quote_spent') quotes++
    }
    return { totalSpent: spent, totalPurchased: purchased, quoteCount: quotes }
  }, [transactions])

  const columns: Array<ColumnDef<any>> = useMemo(() => {
    const tc = (key: string) => t(`dashboard/credits:${key}`)
    return [
    {
      id: 'transaction',
      header: tc('revenue.columns.transaction'),
      cell: ({ row }) => {
        const txn = row.original
        const isCredit = txn.amount > 0
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-1.5 rounded-lg shrink-0',
              isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30',
            )}>
              {isCredit
                ? <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                : <ArrowDownRight className="size-4 text-red-600 dark:text-red-400" />
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs truncate">
                  {tc(`revenue.transaction_types.${txn.type}`)}
                </span>
                <GlowingBadge
                  variant={txn.type === 'quote_spent' ? 'error' : txn.type === 'bonus' ? 'warning' : isCredit ? 'success' : 'default'}
                  className="text-[9px] uppercase"
                >
                  {tc(`revenue.transaction_types.${txn.type}`)}
                </GlowingBadge>
              </div>
              {txn.description && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {txn.description}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: 'date',
      header: tc('revenue.columns.date'),
      cell: ({ row }) => {
        const txn = row.original
        return (
          <span className="text-xs text-muted-foreground">
            {txn.createdAt && new Date(txn.createdAt).toLocaleDateString(locale)}
          </span>
        )
      },
    },
    {
      id: 'amount',
      header: () => <span className="text-end block">{tc('revenue.columns.amount')}</span>,
      cell: ({ row }) => {
        const txn = row.original
        const isCredit = txn.amount > 0
        return (
          <span className={cn(
            'text-end block text-sm font-black tabular-nums',
            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
          )}>
            {isCredit ? '+' : ''}{txn.amount}
          </span>
        )
      },
    },
    ]
  }, [t, locale])

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <DirectionProvider dir={dir}>
      <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2" dir={dir}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-amber-500/20 shrink-0">
              <Coins className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {tc('billing.title')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {tc('billing.subtitle')}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setRequestDialogOpen(true)}
            className="h-9 px-4 rounded-xl gap-2 text-xs font-bold w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            <Send className="size-3.5" />
            {tc('billing.request_action')}
          </Button>
        </div>

        {/* Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 sm:p-8 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="size-5 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {tc('billing.current_balance')}
            </span>
          </div>
          <p className="text-5xl sm:text-6xl font-black tabular-nums leading-none tracking-tighter">
            {balance.toLocaleString()}
          </p>
          <p className="text-sm font-bold mt-1 opacity-80">
            {tc('billing.credits_available')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 px-4 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="size-3 text-emerald-500" /> {tc('billing.total_purchased')}
            </span>
            <span className="text-xl font-black tabular-nums text-emerald-700 dark:text-emerald-300">
              {totalPurchased.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="size-3 text-red-500" /> {tc('billing.total_spent')}
            </span>
            <span className="text-xl font-black tabular-nums text-red-700 dark:text-red-300">
              {totalSpent.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3 text-blue-500" /> {tc('billing.quote_count')}
            </span>
            <span className="text-xl font-black tabular-nums text-blue-700 dark:text-blue-300">
              {quoteCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
            {tc('revenue.transactions')}
          </p>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <ShoppingBag className="size-10 text-muted-foreground/20" />
              <p className="text-sm font-bold text-muted-foreground">
                {tc('billing.no_activity')}
              </p>
              <Button asChild className="rounded-xl text-xs font-bold">
                <a href="/explore">
                  {t('dashboard/seller:actions.browse_requests')} <ArrowRight className="size-3.5 ms-1.5" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-xs font-bold">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="border-t border-border px-4 py-3">
                <DataTablePagination table={table} />
              </div>
            </div>
          )}
        </div>
      </div>

      <RequestCreditsDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} />
    </DirectionProvider>
  )
}
