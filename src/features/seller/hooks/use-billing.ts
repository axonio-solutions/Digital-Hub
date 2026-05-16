'use client'

import { useQuery } from '@tanstack/react-query'
import { getMyCreditBalanceServerFn } from '@/fn/credits'
import { creditKeys } from '@/features/credits/hooks/use-credits'

export function useSellerCreditBalance() {
  return useQuery({
    queryKey: [...creditKeys.all, 'my-balance'],
    queryFn: () => (getMyCreditBalanceServerFn as any)(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
