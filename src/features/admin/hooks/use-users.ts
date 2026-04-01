import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllUsersServerFn, toggleUserBanServerFn, activateSellerServerFn } from '@/fn/admin'

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    // @ts-ignore
    queryFn: () => getAllUsersServerFn(),
  })
}

export function useToggleUserBan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { userId: string; isBanned: boolean }) => 
      toggleUserBanServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useActivateSeller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { userId: string }) => 
      activateSellerServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
