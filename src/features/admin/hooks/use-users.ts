import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllUsersServerFn, getUserDetailsServerFn, toggleUserBanServerFn, activateSellerServerFn } from '@/fn/admin'
import { adminKeys } from './use-admin'

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    // @ts-ignore
    queryFn: () => getAllUsersServerFn(),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useToggleUserBan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { userId: string; isBanned: boolean }) => 
      toggleUserBanServerFn({ data }),
    onMutate: async ({ userId, isBanned }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.users() })
      const previousUsers = queryClient.getQueryData(adminKeys.users())
      queryClient.setQueryData(adminKeys.users(), (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((u: any) => u.id === userId ? { ...u, banned: isBanned } : u)
      })
      return { previousUsers }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(adminKeys.users(), context.previousUsers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

export function useActivateSeller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { userId: string }) => 
      activateSellerServerFn({ data }),
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.users() })
      const previousUsers = queryClient.getQueryData(adminKeys.users())
      queryClient.setQueryData(adminKeys.users(), (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((u: any) => u.id === userId ? { ...u, account_status: 'active' } : u)
      })
      return { previousUsers }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(adminKeys.users(), context.previousUsers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

export const userDetailKeys = {
  detail: (userId: string) => [...adminKeys.users(), 'detail', userId] as const,
}

export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: userDetailKeys.detail(userId),
    queryFn: () => (getUserDetailsServerFn as any)({ data: { userId } }),
    enabled: !!userId,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })
}
