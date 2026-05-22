import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  acceptQuoteServerFn,
  rejectQuoteServerFn,
  revokeQuoteServerFn,
  sendReminderServerFn,
  unrejectQuoteServerFn,
} from '@/fn/quotes'
import { fulfillRequestServerFn } from '@/fn/requests'

export const quoteKeys = {
  all: ['quotes'] as const,
}

function updateQuoteInDetailsCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  quoteId: string,
  updater: (quote: any) => any,
) {
  queryClient
    .getQueryCache()
    .findAll({ queryKey: ['requests', 'details'] })
    .forEach((query) => {
      queryClient.setQueryData(query.queryKey, (old: any) => {
        if (!old?.quotes) return old
        return {
          ...old,
          quotes: old.quotes.map((q: any) =>
            q.id === quoteId ? updater(q) : q,
          ),
        }
      })
    })
}

export function useAcceptQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await acceptQuoteServerFn({ data: { quoteId } })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (quoteId) => {
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(quoteKeys.all, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((q: any) =>
          q.id === quoteId ? { ...q, status: 'accepted' } : q,
        )
      })

      updateQuoteInDetailsCaches(queryClient, quoteId, (q) => ({
        ...q,
        status: 'accepted',
      }))

      return { previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousQuotes)
        queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: quoteKeys.all,
        refetchType: 'inactive',
      })
    },
  })
}

export function useRevokeQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await revokeQuoteServerFn({ data: { quoteId } })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (quoteId) => {
      await queryClient.cancelQueries({ queryKey: quoteKeys.all })

      const previousQuotes = queryClient.getQueryData(quoteKeys.all)

      queryClient.setQueryData(quoteKeys.all, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((q: any) =>
          q.id === quoteId ? { ...q, status: 'pending' } : q,
        )
      })

      updateQuoteInDetailsCaches(queryClient, quoteId, (q) => ({
        ...q,
        status: 'pending',
      }))

      return { previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousQuotes)
        queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: quoteKeys.all,
        refetchType: 'inactive',
      })
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
        return old.map((q: any) =>
          q.id === quoteId ? { ...q, status: 'rejected' } : q,
        )
      })

      updateQuoteInDetailsCaches(queryClient, quoteId, (q) => ({
        ...q,
        status: 'rejected',
      }))

      return { previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousQuotes)
        queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: quoteKeys.all,
        refetchType: 'inactive',
      })
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
        return old.map((q: any) =>
          q.id === quoteId ? { ...q, status: 'pending' } : q,
        )
      })

      updateQuoteInDetailsCaches(queryClient, quoteId, (q) => ({
        ...q,
        status: 'pending',
      }))

      return { previousQuotes }
    },
    onError: (_err, _quoteId, context) => {
      if (context?.previousQuotes)
        queryClient.setQueryData(quoteKeys.all, context.previousQuotes)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: quoteKeys.all,
        refetchType: 'inactive',
      })
    },
  })
}

export function useSendReminder() {
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await sendReminderServerFn({ data: { quoteId } })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
  })
}

export function useFulfillRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fulfillRequestServerFn({ data: requestId })
      if (!res.success) throw new Error((res as any).error)
      return res
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({
        queryKey: ['requests', 'details', requestId],
      })

      const previousRequestDetails = queryClient.getQueryData([
        'requests',
        'details',
        requestId,
      ])

      queryClient.setQueryData(
        ['requests', 'details', requestId],
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            status: 'fulfilled',
            quotes: old.quotes?.map((q: any) =>
              q.status === 'pending' ? { ...q, status: 'rejected' } : q,
            ),
          }
        },
      )

      return { previousRequestDetails }
    },
    onError: (_err, requestId, context) => {
      if (context?.previousRequestDetails) {
        queryClient.setQueryData(
          ['requests', 'details', requestId],
          context.previousRequestDetails,
        )
      }
    },
    onSettled: (_data, _error, requestId) => {
      queryClient.invalidateQueries({
        queryKey: ['requests', 'details', requestId],
        refetchType: 'inactive',
      })
      queryClient.invalidateQueries({
        queryKey: quoteKeys.all,
        refetchType: 'inactive',
      })
    },
  })
}
