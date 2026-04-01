import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRequestServerFn,
  fetchAllRequestsServerFn,
  fetchOpenRequestsServerFn,
  fetchRequestDetailsServerFn,
  cancelRequestServerFn,
  reopenRequestServerFn,
  deleteRequestServerFn,
  updateRequestServerFn,
  fetchPublicOpenRequestsServerFn,
  getPublicTaxonomyServerFn,
} from '@/fn/requests'

export const requestKeys = {
  all: ['requests'] as const,
  open: () => [...requestKeys.all, 'open'] as const,
  allRequests: () => [...requestKeys.all, 'allRequests'] as const,
  public: () => [...requestKeys.all, 'public'] as const,
  taxonomy: () => [...requestKeys.all, 'taxonomy'] as const,
  details: (requestId: string) => [...requestKeys.all, 'details', requestId] as const,
}


export function useOpenRequests(filters?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  brandIds?: string[];
  search?: string;
  specialtyFilter?: {
    brandIds: string[];
    categoryIds: string[];
  };
}) {
  return useQuery({
    queryKey: [...requestKeys.open(), filters],
    queryFn: async () => {
      const res = await fetchOpenRequestsServerFn({ data: filters })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
  })
}

export function useRequestDetails(requestId: string) {
  return useQuery({
    queryKey: requestKeys.details(requestId),
    queryFn: async () => {
      const res = await fetchRequestDetailsServerFn({ data: requestId })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: !!requestId,
  })
}

export function useAllRequests() {
  return useQuery({
    queryKey: requestKeys.allRequests(),
    queryFn: async () => {
      const res = await fetchAllRequestsServerFn()
      if (!res.success) throw new Error(res.error)
      return res.data
    },
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await createRequestServerFn({ data })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      queryClient.invalidateQueries({ queryKey: ['buyer'] })
    },
  })
}

export function useInfinitePublicOpenRequests(filters?: {
  categoryId?: string;
  brandIds?: string[];
  search?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: [...requestKeys.public(), filters],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetchPublicOpenRequestsServerFn({
        data: {
          ...filters,
          limit: filters?.limit || 12,
          offset: pageParam,
        }
      })
      return res.data || []
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < (filters?.limit || 12)) return undefined
      return allPages.length * (filters?.limit || 12)
    },
    initialPageParam: 0,
  })
}

export function usePublicOpenRequests() {
  return useQuery({
    queryKey: requestKeys.public(),
    queryFn: async () => {
      const res = await fetchPublicOpenRequestsServerFn({ data: {} })
      return res.data || []
    },
  })
}

export function usePublicTaxonomy() {
  return useQuery({
    queryKey: requestKeys.taxonomy(),
    queryFn: async () => {
      const res = await getPublicTaxonomyServerFn() as any
      if (!res.success) throw new Error(res.error || 'Failed to fetch taxonomy')
      return res.data
    },
  })
}

export function useCancelRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await cancelRequestServerFn({ data: requestId })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({
        queryKey: requestKeys.details(requestId),
      })
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      queryClient.invalidateQueries({ queryKey: ['buyer'] })
    },
  })
}

export function useReopenRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await reopenRequestServerFn({ data: requestId })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({
        queryKey: requestKeys.details(requestId),
      })
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      queryClient.invalidateQueries({ queryKey: ['buyer'] })
    },
  })
}

export function useDeleteRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await deleteRequestServerFn({ data: requestId })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      queryClient.invalidateQueries({ queryKey: ['buyer'] })
    },
  })
}

export function useUpdateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await updateRequestServerFn({ data: { id, payload } })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.details(variables.id) })
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      queryClient.invalidateQueries({ queryKey: ['buyer'] })
    },
  })
}
