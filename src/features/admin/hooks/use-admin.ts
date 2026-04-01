import { useQuery } from '@tanstack/react-query'
import { getAdminMetricsServerFn } from '@/fn/admin'

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => (getAdminMetricsServerFn as any)(),
  })
}
