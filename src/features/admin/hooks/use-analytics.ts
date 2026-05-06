import { useQuery } from '@tanstack/react-query'
import {
  getAdvancedSystemMetricsServerFn,
  getAdminDashboardStatsServerFn,
  getBuyerAnalyticsServerFn,
  getSellerAnalyticsServerFn,
} from '@/fn/admin'

export function useBuyerAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'buyers'],
    queryFn: () => (getBuyerAnalyticsServerFn as any)(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSellerAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'sellers'],
    queryFn: () => (getSellerAnalyticsServerFn as any)(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'system'],
    queryFn: () => (getAdvancedSystemMetricsServerFn as any)(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => (getAdminDashboardStatsServerFn as any)(),
    staleTime: 5 * 60 * 1000,
  })
}
