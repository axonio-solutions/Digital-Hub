import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBuyerRequestsServerFn, fetchOpenRequestsServerFn, fetchAllRequestsServerFn, createRequestServerFn } from "@/fn/requests";

export const requestKeys = {
  all: ['requests'] as const,
  buyer: (buyerId: string) => [...requestKeys.all, 'buyer', buyerId] as const,
  open: () => [...requestKeys.all, 'open'] as const,
  allRequests: () => [...requestKeys.all, 'allRequests'] as const,
};

export function useBuyerRequests(buyerId: string) {
  return useQuery({
    queryKey: requestKeys.buyer(buyerId),
    queryFn: async () => {
      const res = await fetchBuyerRequestsServerFn();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!buyerId,
  });
}

export function useOpenRequests() {
  return useQuery({
    queryKey: requestKeys.open(),
    queryFn: async () => {
      const res = await fetchOpenRequestsServerFn();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useAllRequests() {
  return useQuery({
    queryKey: requestKeys.allRequests(),
    queryFn: async () => {
      const res = await fetchAllRequestsServerFn();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await createRequestServerFn({ data });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.buyer(variables.buyerId) });
      queryClient.invalidateQueries({ queryKey: requestKeys.open() });
    },
  });
}
