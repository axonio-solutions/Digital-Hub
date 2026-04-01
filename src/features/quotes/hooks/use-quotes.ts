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
    onSuccess: (_, variables) => {
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests', 'details', variables.requestId] })
      queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },
  })
}
