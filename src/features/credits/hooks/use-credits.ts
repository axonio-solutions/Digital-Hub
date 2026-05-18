import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSellersWithCreditsServerFn,
  grantCreditsServerFn,
  getCreditTransactionsServerFn,
  getCreditPackagesServerFn,
  getActiveCreditPackagesServerFn,
  createCreditPackageServerFn,
  updateCreditPackageServerFn,
  toggleCreditPackageStatusServerFn,
  getRevenueMetricsServerFn,
  requestCreditsServerFn,
  getCreditRequestsServerFn,
  approveCreditRequestServerFn,
  rejectCreditRequestServerFn,
  getPendingCreditRequestsCountServerFn,
} from '@/fn/credits'

export const creditKeys = {
  all: ['credits'] as const,
  sellers: () => [...creditKeys.all, 'sellers'] as const,
  transactions: () => [...creditKeys.all, 'transactions'] as const,
  packages: () => [...creditKeys.all, 'packages'] as const,
  revenue: () => [...creditKeys.all, 'revenue'] as const,
}

export function useSellersWithCredits() {
  return useQuery({
    queryKey: creditKeys.sellers(),
    queryFn: () => (getSellersWithCreditsServerFn as any)(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useGrantCredits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { sellerId: string; amount: number; description?: string }) =>
      grantCreditsServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.sellers() })
      queryClient.invalidateQueries({ queryKey: creditKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: creditKeys.revenue() })
    },
  })
}

export function useCreditTransactions(sellerId?: string) {
  return useQuery({
    queryKey: [...creditKeys.transactions(), sellerId],
    queryFn: () => (getCreditTransactionsServerFn as any)({ data: { sellerId } }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useCreditPackages() {
  return useQuery({
    queryKey: creditKeys.packages(),
    queryFn: () => (getCreditPackagesServerFn as any)(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useActiveCreditPackages() {
  return useQuery({
    queryKey: [...creditKeys.all, 'active-packages'],
    queryFn: () => (getActiveCreditPackagesServerFn as any)(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateCreditPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; credits: number; price: number; description?: string }) =>
      createCreditPackageServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.packages() })
    },
  })
}

export function useUpdateCreditPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      id: string
      name?: string
      credits?: number
      price?: number
      description?: string
      isActive?: boolean
    }) => updateCreditPackageServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.packages() })
    },
  })
}

export function useToggleCreditPackageStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; isActive: boolean }) =>
      toggleCreditPackageStatusServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.packages() })
    },
  })
}

export function useRevenueMetrics() {
  return useQuery({
    queryKey: creditKeys.revenue(),
    queryFn: () => (getRevenueMetricsServerFn as any)(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useRequestCredits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { credits: number; packageId?: string }) =>
      requestCreditsServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...creditKeys.all, 'my-requests'] })
    },
  })
}

export function useCreditRequests(status?: string) {
  return useQuery({
    queryKey: [...creditKeys.all, 'requests', status],
    queryFn: () => (getCreditRequestsServerFn as any)({ data: { status } }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useApproveCreditRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string }) => approveCreditRequestServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...creditKeys.all, 'requests'] })
      queryClient.invalidateQueries({ queryKey: creditKeys.sellers() })
      queryClient.invalidateQueries({ queryKey: creditKeys.revenue() })
    },
  })
}

export function useRejectCreditRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; adminNote?: string }) =>
      rejectCreditRequestServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...creditKeys.all, 'requests'] })
    },
  })
}

export function usePendingCreditRequestsCount() {
  return useQuery({
    queryKey: [...creditKeys.all, 'pending-count'],
    queryFn: () => (getPendingCreditRequestsCountServerFn as any)(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
