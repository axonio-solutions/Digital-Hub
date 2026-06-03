import { queryOptions } from '@tanstack/react-query'
import {
  fetchCreditBalance,
  fetchSellerDashboardStats,
} from '../../../lib/api-client'

export const sellerDashboardQueryOptions = queryOptions({
  queryKey: ['seller-dashboard'],
  queryFn: fetchSellerDashboardStats,
  staleTime: 2 * 60 * 1000,
})

export const creditBalanceQueryOptions = queryOptions({
  queryKey: ['credit-balance'],
  queryFn: fetchCreditBalance,
  staleTime: 60 * 1000,
})
