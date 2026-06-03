import { queryOptions } from '@tanstack/react-query'
import { fetchSellerQuotes } from '../../../lib/api-client'

export const sellerQuotesQueryOptions = queryOptions({
  queryKey: ['seller-quotes'],
  queryFn: fetchSellerQuotes,
  staleTime: 2 * 60 * 1000,
})
