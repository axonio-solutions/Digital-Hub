import { keepPreviousData, useQuery, queryOptions } from '@tanstack/react-query'
import {
  getAdvancedSystemMetricsServerFn,
  getAdminDashboardStatsServerFn,
  getBuyerAnalyticsServerFn,
  getSellerAnalyticsServerFn,
  getMarketGapAnalysisServerFn,
} from '@/fn/admin'
import { adminKeys } from './use-admin'
import type { BuyerAnalyticsData, SellerAnalyticsData } from '@/types/analytics'

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 30 * 60 * 1000

export const adminAnalyticsQueries = {
  buyers: () =>
    queryOptions({
      queryKey: adminKeys.analytics('buyers'),
      queryFn: () => getBuyerAnalyticsServerFn() as Promise<BuyerAnalyticsData>,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    }),
  sellers: () =>
    queryOptions({
      queryKey: adminKeys.analytics('sellers'),
      queryFn: () => getSellerAnalyticsServerFn() as Promise<SellerAnalyticsData>,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    }),
}

export function useBuyerAnalytics() {
  return useQuery(adminAnalyticsQueries.buyers())
}

export function useSellerAnalytics() {
  return useQuery(adminAnalyticsQueries.sellers())
}

export function useSystemMetrics(days?: number) {
  return useQuery({
    queryKey: [...adminKeys.systemMetrics(), days],
    queryFn: () => getAdvancedSystemMetricsServerFn({ data: { days } }),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  })
}

export function useMarketGapAnalysis() {
  return useQuery({
    queryKey: adminKeys.marketGap(),
    queryFn: () => getMarketGapAnalysisServerFn(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  })
}

export function useAdminDashboardStats(days?: number) {
  return useQuery({
    queryKey: [...adminKeys.dashboardStats(), days],
    queryFn: () => getAdminDashboardStatsServerFn({ data: { days } }),
    staleTime: 2 * 60 * 1000,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  })
}
