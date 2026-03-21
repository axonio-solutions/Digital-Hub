import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuoteServerFn, acceptQuoteServerFn, getSellerQuotesServerFn } from "@/fn/quotes";

export const quoteKeys = {
  all: ['quotes'] as const,
  seller: (sellerId: string) => [...quoteKeys.all, 'seller', sellerId] as const,
};

export function useSubmitQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await createQuoteServerFn({ data });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { quoteId: string, requestId: string }) => {
      const res = await acceptQuoteServerFn({ data });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useSellerQuotes(sellerId: string) {
  return useQuery({
    queryKey: quoteKeys.seller(sellerId),
    queryFn: async () => {
      const res = await getSellerQuotesServerFn();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!sellerId,
  });
}
