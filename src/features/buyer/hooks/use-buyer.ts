import { useQuery } from '@tanstack/react-query'
import { fetchBuyerRequestsServerFn } from '@/fn/requests'

export const buyerKeys = {
  all: ['buyer'] as const,
  requests: (buyerId: string) => [...buyerKeys.all, 'requests', buyerId] as const,
  analytics: (buyerId: string) => [...buyerKeys.all, 'analytics', buyerId] as const,
}

export function useBuyerRequests(buyerId: string) {
  return useQuery({
    queryKey: buyerKeys.requests(buyerId),
    queryFn: async () => {
      const res = await fetchBuyerRequestsServerFn()
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: !!buyerId,
  })
}
