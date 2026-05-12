import { useQuery } from '@tanstack/react-query'
import { getAdminMetricsServerFn, getRecentActivityServerFn } from '@/fn/admin'

export const adminKeys = {
  all: ['admin'] as const,
  metrics: () => [...adminKeys.all, 'metrics'] as const,
  analytics: (type: 'buyers' | 'sellers') => [...adminKeys.all, 'analytics', type] as const,
  systemMetrics: () => [...adminKeys.all, 'analytics', 'system'] as const,
  dashboardStats: () => [...adminKeys.all, 'dashboard', 'stats'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  recentActivity: () => [...adminKeys.all, 'recentActivity'] as const,
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: adminKeys.metrics(),
    queryFn: () => (getAdminMetricsServerFn as any)(),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: adminKeys.recentActivity(),
    queryFn: () => (getRecentActivityServerFn as any)(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
