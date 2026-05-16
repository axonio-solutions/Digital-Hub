import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DirectionProvider } from '@/components/ui/direction'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreditRequests, useApproveCreditRequest, useRejectCreditRequest } from '@/features/credits/hooks/use-credits'
import { useCreditRequestsColumns } from '@/features/credits/components/credit-requests-columns'
import { CreditPackages } from '@/features/credits/components/credit-packages'
import { creditKeys } from '@/features/credits/hooks/use-credits'

export const Route = createFileRoute('/_authed/dashboard/admin/credit-requests/')({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ context }) => {
    const { getCreditRequestsServerFn } = await import('@/fn/credits')
    await context.queryClient.ensureQueryData({
      queryKey: [...creditKeys.all, 'requests', undefined],
      queryFn: () => (getCreditRequestsServerFn as any)({ data: {} }),
      staleTime: 30 * 1000,
    }).catch(() => {})
  },
  component: CreditRequestsRoute,
  pendingComponent: CreditRequestsSkeleton,
})

function CreditRequestsRoute() {
  const { t, i18n } = useTranslation('dashboard/credits')
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  const [tab, setTab] = useState('requests')
  const [filter, setFilter] = useState<string | undefined>(undefined)

  const { data: requests = [], isLoading } = useCreditRequests(filter)
  const { mutate: approve, isPending: isApproving } = useApproveCreditRequest()
  const { mutate: reject, isPending: isRejecting } = useRejectCreditRequest()

  const columns = useCreditRequestsColumns(approve, reject, isApproving, isRejecting)

  const pendingCount = useMemo(() => requests.filter((r: any) => r.status === 'pending').length, [requests])

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('credit_requests.filter_pending')
      case 'approved': return t('credit_requests.filter_approved')
      case 'rejected': return t('credit_requests.filter_rejected')
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-amber-500/20 shrink-0">
          <Send className="size-5" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{t('credit_requests.title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {t('credit_requests.subtitle')}
          </p>
        </div>
      </div>

      <DirectionProvider dir={dir}>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="requests" className="text-xs font-bold">
            {t('credit_requests.tabs.requests')}
          </TabsTrigger>
          <TabsTrigger value="packages" className="text-xs font-bold">
            {t('credit_requests.tabs.packages')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 space-y-4">
          {/* Filter buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[undefined, 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f || 'all'}
                onClick={() => setFilter(f)}
                className={`shrink-0 h-8 text-[10px] font-bold px-3 rounded-lg border transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent'
                }`}
              >
                {f ? statusLabel(f) : t('credit_requests.filter_all')}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 size-4 rounded-full bg-amber-500 text-white text-[8px] font-black inline-flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <CreditRequestsSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={requests}
              pagination
              className="w-full"
            />
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-4">
          <CreditPackages />
        </TabsContent>
      </Tabs>
      </DirectionProvider>
    </div>
  )
}

function CreditRequestsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}
