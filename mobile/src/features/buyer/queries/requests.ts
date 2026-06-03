import { queryOptions } from '@tanstack/react-query'
import {
  fetchBuyerRequests,
  fetchRequestDetails,
  fetchAnonymousQuotes,
} from '../../../lib/api-client'

export const buyerRequestsQueryOptions = queryOptions({
  queryKey: ['buyer-requests'],
  queryFn: fetchBuyerRequests,
  staleTime: 2 * 60 * 1000,
})

export function buyerRequestDetailQueryOptions(requestId: string) {
  return queryOptions({
    queryKey: ['buyer-request', requestId],
    queryFn: () => fetchRequestDetails(requestId),
    staleTime: 2 * 60 * 1000,
    enabled: !!requestId,
  })
}

export function anonymousQuotesQueryOptions(requestId: string) {
  return queryOptions({
    queryKey: ['anonymous-quotes', requestId],
    queryFn: () => fetchAnonymousQuotes(requestId),
    staleTime: 60 * 1000,
    enabled: !!requestId,
  })
}
