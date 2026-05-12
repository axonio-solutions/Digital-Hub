import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getAdvancedSystemMetricsServerFn,
  getAdminDashboardStatsServerFn,
  getBuyerAnalyticsServerFn,
  getSellerAnalyticsServerFn,
} from '@/fn/admin'
import { adminKeys } from './use-admin'

export function useBuyerAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics('buyers'),
    queryFn: () => (getBuyerAnalyticsServerFn as any)(),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useSellerAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics('sellers'),
    queryFn: () => (getSellerAnalyticsServerFn as any)(),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: adminKeys.systemMetrics(),
    queryFn: () => (getAdvancedSystemMetricsServerFn as any)(),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboardStats(),
    queryFn: () => (getAdminDashboardStatsServerFn as any)(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}
