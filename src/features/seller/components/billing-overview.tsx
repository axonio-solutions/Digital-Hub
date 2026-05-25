'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Coins,
  Send,
  ShoppingBag,
} from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useSellerCreditBalance } from '../hooks/use-billing'
import type { ColumnDef } from '@tanstack/react-table'
import { DirectionProvider } from '@/components/ui/direction'
import { Skeleton } from '@/components/ui/skeleton'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Button } from '@/components/ui/button'
import { CircularProgressCombined } from '@/components/ui/circular-progress'
import { Stat, StatIndicator, StatLabel, StatValue } from '@/components/ui/stat'
import { cn } from '@/lib/utils'
import { RequestCreditsDialog } from '@/features/credits/components/request-credits-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { PUBLIC_ROUTES } from '@/lib/routes'

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

  const { totalSpent, totalPurchased } = useMemo(() => {
    let spent = 0,
      purchased = 0
    for (const txn of transactions) {
      if (txn.amount < 0) spent += Math.abs(txn.amount)
      else purchased += txn.amount
    }
    return { totalSpent: spent, totalPurchased: purchased }
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
              <div
                className={cn(
                  'p-1.5 rounded-lg shrink-0',
                  isCredit
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-red-100 dark:bg-red-900/30',
                )}
              >
                {isCredit ? (
                  <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ArrowDownRight className="size-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs truncate">
                    {tc(`revenue.transaction_types.${txn.type}`)}
                  </span>
                  <GlowingBadge
                    variant={
                      txn.type === 'quote_spent'
                        ? 'error'
                        : txn.type === 'bonus'
                          ? 'warning'
                          : isCredit
                            ? 'success'
                            : 'default'
                    }
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
              {txn.createdAt &&
                new Date(txn.createdAt).toLocaleDateString(locale)}
            </span>
          )
        },
      },
      {
        id: 'amount',
        header: () => (
          <span className="text-end block">{tc('revenue.columns.amount')}</span>
        ),
        cell: ({ row }) => {
          const txn = row.original
          const isCredit = txn.amount > 0
          return (
            <span
              className={cn(
                'text-end block text-sm font-black tabular-nums',
                isCredit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {isCredit ? '+' : ''}
              {txn.amount}
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
            className="h-10 px-6 rounded-xl gap-2 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shrink-0"
          >
            <Send className="size-4" />
            {tc('billing.request_action')}
          </Button>
        </div>

        {/* Stats: Purchased / Spent / Remaining */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat>
            <StatLabel>{tc('billing.total_purchased')}</StatLabel>
            <StatIndicator variant="icon" color="success">
              <ArrowUpRight />
            </StatIndicator>
            <StatValue>{totalPurchased.toLocaleString()}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>{tc('billing.total_spent')}</StatLabel>
            <StatIndicator variant="icon" color="error">
              <ArrowDownRight />
            </StatIndicator>
            <StatValue>{totalSpent.toLocaleString()}</StatValue>
          </Stat>
          <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="[&_circle[data-max]]:text-amber-500 [&_circle[data-max]]:stroke-amber-500">
                <CircularProgressCombined
                  value={totalSpent}
                  max={Math.max(totalPurchased, 1)}
                  size={72}
                  thickness={6}
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-tight">
                {tc('billing.current_balance')}
              </p>
              <p className="text-lg font-bold tabular-nums text-foreground leading-none mt-1">
                {balance.toLocaleString()} {tc('billing.credits_available')}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                {tc('revenue.transactions')}
              </p>
              {transactions.length > 0 && (
                <span className="text-[10px] font-bold tabular-nums bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md leading-none">
                  {transactions.length}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-medium">
              Recent activity
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <ShoppingBag className="size-10 text-muted-foreground/20" />
              <p className="text-sm font-bold text-muted-foreground">
                {tc('billing.no_activity')}
              </p>
              <Button asChild className="rounded-xl text-xs font-bold">
                <a href={PUBLIC_ROUTES.EXPLORE}>
                  {t('dashboard/seller:actions.browse_requests')}{' '}
                  <ArrowRight className="size-3.5 ms-1.5" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="hidden">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-3.5 first:pl-5 last:pr-5"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="border-t border-border/60 px-5 py-2.5">
                <DataTablePagination table={table} />
              </div>
            </div>
          )}
        </div>
      </div>

      <RequestCreditsDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
      />
    </DirectionProvider>
  )
}
