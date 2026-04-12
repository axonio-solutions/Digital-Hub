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
    onMutate: async (newRequestPayload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: requestKeys.all })
      await queryClient.cancelQueries({ queryKey: ['buyer'] })

      // Snapshot previous requests
      const previousGlobalRequests = queryClient.getQueryData(requestKeys.allRequests())
      
      const optimisticRequest = {
        ...newRequestPayload,
        id: `temp-${Date.now()}`,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        quotesCount: 0,
      }

      // 1. Optimistically add to the global requests list
      queryClient.setQueryData(requestKeys.allRequests(), (old: any) => {
        if (!Array.isArray(old)) return [optimisticRequest]
        return [optimisticRequest, ...old]
      })

      // 2. Optimistically add to the Buyer's personal requests list
      // We try to find all 'buyer' 'requests' queries in the cache
      queryClient.getQueryCache().findAll({ queryKey: ['buyer', 'requests'] }).forEach(query => {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!Array.isArray(old)) return [optimisticRequest]
          return [optimisticRequest, ...old]
        })
      })

      return { previousGlobalRequests }
    },
    onError: (_err, _newRequest, context) => {
      if (context?.previousGlobalRequests) {
        queryClient.setQueryData(requestKeys.allRequests(), context.previousGlobalRequests)
      }
    },

    onSettled: () => {
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

export function usePublicOpenRequests(filters?: {
  categoryId?: string;
  brandIds?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...requestKeys.public(), filters],
    queryFn: async () => {
      const res = await fetchPublicOpenRequestsServerFn({ 
        data: {
          ...filters,
          limit: filters?.limit || 12,
          offset: filters?.offset || 0,
        } 
      })
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
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.all })
      await queryClient.cancelQueries({ queryKey: requestKeys.details(requestId) })

      const previousDetails = queryClient.getQueryData(requestKeys.details(requestId))
      const previousAll = queryClient.getQueryData(requestKeys.allRequests())

      // Update Details
      queryClient.setQueryData(requestKeys.details(requestId), (old: any) => ({
        ...old,
        status: 'CANCELLED'
      }))

      // Update List
      queryClient.setQueryData(requestKeys.allRequests(), (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map(r => r.id === requestId ? { ...r, status: 'CANCELLED' } : r)
      })

      return { previousDetails, previousAll }
    },
    onError: (_err, requestId, context) => {
      if (context?.previousDetails) queryClient.setQueryData(requestKeys.details(requestId), context.previousDetails)
      if (context?.previousAll) queryClient.setQueryData(requestKeys.allRequests(), context.previousAll)
    },
    onSettled: (_data, _error, requestId) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.details(requestId) })
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
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.all })
      await queryClient.cancelQueries({ queryKey: requestKeys.details(requestId) })

      const previousDetails = queryClient.getQueryData(requestKeys.details(requestId))
      const previousAll = queryClient.getQueryData(requestKeys.allRequests())

      queryClient.setQueryData(requestKeys.details(requestId), (old: any) => ({
        ...old,
        status: 'OPEN'
      }))

      queryClient.setQueryData(requestKeys.allRequests(), (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map(r => r.id === requestId ? { ...r, status: 'OPEN' } : r)
      })

      return { previousDetails, previousAll }
    },
    onError: (_err, requestId, context) => {
      if (context?.previousDetails) queryClient.setQueryData(requestKeys.details(requestId), context.previousDetails)
      if (context?.previousAll) queryClient.setQueryData(requestKeys.allRequests(), context.previousAll)
    },
    onSettled: (_data, _error, requestId) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.details(requestId) })
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
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.all })
      
      const previousAll = queryClient.getQueryData(requestKeys.allRequests())

      // Optimistically remove from list
      queryClient.setQueryData(requestKeys.allRequests(), (old: any) => {
        if (!Array.isArray(old)) return old
        return old.filter(r => r.id !== requestId)
      })

      return { previousAll }
    },
    onError: (_err, _requestId, context) => {
      if (context?.previousAll) queryClient.setQueryData(requestKeys.allRequests(), context.previousAll)
    },

    onSettled: () => {
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
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.all })
      await queryClient.cancelQueries({ queryKey: requestKeys.details(id) })

      const previousDetails = queryClient.getQueryData(requestKeys.details(id))
      const previousAll = queryClient.getQueryData(requestKeys.allRequests())

      // Update Details
      queryClient.setQueryData(requestKeys.details(id), (old: any) => ({
        ...old,
        ...payload
      }))

      // Update List
      queryClient.setQueryData(requestKeys.allRequests(), (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map(r => r.id === id ? { ...r, ...payload } : r)
      })

      return { previousDetails, previousAll }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousDetails) queryClient.setQueryData(requestKeys.details(id), context.previousDetails)
      if (context?.previousAll) queryClient.setQueryData(requestKeys.allRequests(), context.previousAll)
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.details(id) })
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      queryClient.invalidateQueries({ queryKey: ['buyer'] })
    },

  })
}

