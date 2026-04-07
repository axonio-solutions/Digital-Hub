import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  acceptQuoteServerFn,
  rejectQuoteServerFn,
  unrejectQuoteServerFn,
  revokeQuoteServerFn,
} from '@/fn/quotes'

export const quoteKeys = {
  all: ['quotes'] as const,
}

export function useAcceptQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { quoteId: string; requestId: string }) => {
      const res = await acceptQuoteServerFn({ data })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to prevent overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['requests'] })
      await queryClient.cancelQueries({ queryKey: ['requests', 'details', variables.requestId] })
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      // Snapshot previous values
      const previousRequestDetails = queryClient.getQueryData(['requests', 'details', variables.requestId])
      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      // Optimistically update request details and status
      queryClient.setQueryData(['requests', 'details', variables.requestId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          status: 'ACCEPTED',
          acceptedQuoteId: variables.quoteId,
          quotes: old.quotes?.map((q: any) => 
            q.id === variables.quoteId ? { ...q, status: 'ACCEPTED' } : q
          )
        }
      })

      return { previousRequestDetails, previousQuotes }
    },
    onError: (_err, variables, context) => {
      if (context?.previousRequestDetails) {
        queryClient.setQueryData(['requests', 'details', variables.requestId], context.previousRequestDetails)
      }
      if (context?.previousQuotes) {
        queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests', 'details', variables.requestId] })
      queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },

  })
}


export function useRejectQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await rejectQuoteServerFn({ data: { quoteId } })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (quoteId) => {
      await queryClient.cancelQueries({ queryKey: ['requests'] })
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousRequests = queryClient.getQueryData(['requests'])
      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      // Optimistically mark as rejected in the quotes cache
      queryClient.setQueryData(quoteKeys.all, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((q: any) => q.id === quoteId ? { ...q, status: 'REJECTED' } : q)
      })

      return { previousRequests, previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousRequests) queryClient.setQueryData(['requests'], context.previousRequests)
      if (context?.previousQuotes) queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },

  })
}


export function useUnrejectQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await unrejectQuoteServerFn({ data: { quoteId } })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (quoteId) => {
      await queryClient.cancelQueries({ queryKey: ['requests'] })
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousRequests = queryClient.getQueryData(['requests'])
      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(quoteKeys.all, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((q: any) => q.id === quoteId ? { ...q, status: 'PENDING' } : q)
      })

      return { previousRequests, previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousRequests) queryClient.setQueryData(['requests'], context.previousRequests)
      if (context?.previousQuotes) queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },

  })
}


export function useRevokeQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { quoteId: string; requestId: string }) => {
      const res = await revokeQuoteServerFn({ data })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['requests', 'details', variables.requestId] })
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousRequestDetails = queryClient.getQueryData(['requests', 'details', variables.requestId])
      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(['requests', 'details', variables.requestId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          status: 'PENDING',
          acceptedQuoteId: null,
          quotes: old.quotes?.map((q: any) => 
            q.id === variables.quoteId ? { ...q, status: 'PENDING' } : q
          )
        }
      })

      return { previousRequestDetails, previousQuotes }
    },
    onError: (_err, variables, context) => {
      if (context?.previousRequestDetails) {
        queryClient.setQueryData(['requests', 'details', variables.requestId], context.previousRequestDetails)
      }
      if (context?.previousQuotes) {
        queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests', 'details', variables.requestId] })
      queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },

  })
}

