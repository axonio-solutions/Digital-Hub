import { useQuery } from '@tanstack/react-query'
import {
  getAdvancedSystemMetricsServerFn,
  getAdminDashboardStatsServerFn,
  getBuyerAnalyticsServerFn,
  getSellerAnalyticsServerFn,
  getMarketGapAnalysisServerFn,
} from '@/fn/admin'
import { adminKeys } from './use-admin'

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 30 * 60 * 1000

export function useBuyerAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics('buyers'),
    queryFn: () => getBuyerAnalyticsServerFn(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  })
}

export function useSellerAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics('sellers'),
    queryFn: () => getSellerAnalyticsServerFn(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  })
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
