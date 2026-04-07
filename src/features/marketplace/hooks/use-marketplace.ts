import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createQuoteServerFn,
  deleteQuoteServerFn,
  getSellerQuotesServerFn,
  updateQuoteServerFn,
} from '@/fn/quotes'

export const sellerKeys = {
  all: ['seller'] as const,
  quotes: (sellerId: string) => [...sellerKeys.all, 'quotes', sellerId] as const,
  marketplace: ['marketplace'] as const,
}

export function useSellerQuotes(sellerId: string) {
  return useQuery({
    queryKey: sellerKeys.quotes(sellerId),
    queryFn: async () => {
      const res = await getSellerQuotesServerFn()
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: !!sellerId,
  })
}

export function useSellerDashboardData(sellerId: string) {
  return useQuery({
    queryKey: [...sellerKeys.all, 'dashboard-data', sellerId],
    queryFn: async () => await import('@/fn/quotes').then(m => m.fetchSellerStatsServerFn()),
    enabled: !!sellerId,
  })
}

export function useSubmitQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await createQuoteServerFn({ data })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: sellerKeys.all })
      queryClient.invalidateQueries({ queryKey: ['buyer'] })
    },
  })
}

export function useDeleteQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteQuoteServerFn({ data: { id } })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.all })
    },
  })
}

export function useUpdateQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await updateQuoteServerFn({ data: { id, data } })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.all })
    },
  })
}
