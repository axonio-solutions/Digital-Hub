import { queryOptions } from '@tanstack/react-query'
import { fetchOpenRequests } from '../../../lib/api-client'
import type { OpenRequestFilters } from '../../../types/seller'

export function openRequestsQueryOptions(filters?: OpenRequestFilters) {
  return queryOptions({
    queryKey: ['open-requests', filters],
    queryFn: () => fetchOpenRequests(filters),
    staleTime: 60 * 1000,
  })
}
