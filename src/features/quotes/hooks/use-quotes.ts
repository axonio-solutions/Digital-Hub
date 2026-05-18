import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  acceptQuoteServerFn,
  rejectQuoteServerFn,
  unrejectQuoteServerFn,
  revokeQuoteServerFn,
  withdrawQuoteServerFn,
} from '@/fn/quotes'

export const quoteKeys = {
  all: ['quotes'] as const,
}

function updateQuoteInDetailsCaches(queryClient: ReturnType<typeof useQueryClient>, quoteId: string, updater: (quote: any) => any) {
  queryClient.getQueryCache().findAll({ queryKey: ['requests', 'details'] }).forEach(query => {
    queryClient.setQueryData(query.queryKey, (old: any) => {
      if (!old?.quotes) return old
      return {
        ...old,
        quotes: old.quotes.map((q: any) => q.id === quoteId ? updater(q) : q)
      }
    })
  })
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
      await queryClient.cancelQueries({ queryKey: ['requests', 'details', variables.requestId] })
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousRequestDetails = queryClient.getQueryData(['requests', 'details', variables.requestId])
      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(['requests', 'details', variables.requestId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          status: 'fulfilled',
          acceptedQuoteId: variables.quoteId,
          quotes: old.quotes?.map((q: any) =>
            q.id === variables.quoteId ? { ...q, status: 'accepted' } : { ...q, status: 'rejected' }
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
      queryClient.invalidateQueries({ queryKey: ['requests', 'details', variables.requestId], refetchType: 'inactive' })
      queryClient.invalidateQueries({ queryKey: quoteKeys.all, refetchType: 'inactive' })
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
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(quoteKeys.all, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((q: any) => q.id === quoteId ? { ...q, status: 'rejected' } : q)
      })

      updateQuoteInDetailsCaches(queryClient, quoteId, (q) => ({ ...q, status: 'rejected' }))

      return { previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousQuotes) queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all, refetchType: 'inactive' })
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
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(quoteKeys.all, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((q: any) => q.id === quoteId ? { ...q, status: 'pending' } : q)
      })

      updateQuoteInDetailsCaches(queryClient, quoteId, (q) => ({ ...q, status: 'pending' }))

      return { previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousQuotes) queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all, refetchType: 'inactive' })
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
          status: 'open',
          acceptedQuoteId: null,
          quotes: old.quotes?.map((q: any) => ({ ...q, status: 'pending' }))
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
      queryClient.invalidateQueries({ queryKey: ['requests', 'details', variables.requestId], refetchType: 'inactive' })
      queryClient.invalidateQueries({ queryKey: quoteKeys.all, refetchType: 'inactive' })
    },

  })
}

export function useWithdrawQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await withdrawQuoteServerFn({ data: { id: quoteId } })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (quoteId) => {
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(quoteKeys.all, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((q: any) => q.id === quoteId ? { ...q, status: 'withdrawn' } : q)
      })

      return { previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousQuotes) queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all, refetchType: 'inactive' })
    },
  })
}

