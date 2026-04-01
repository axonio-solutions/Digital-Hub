import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchSellerSpecialtiesServerFn,
  updateSellerSpecialtiesServerFn,
  toggleUserViewModeServerFn,
} from '@/fn/vendors'
import { toast } from 'sonner'

export function useSellerSpecialties() {
  return useQuery({
    queryKey: ['seller-specialties'],
    queryFn: () => fetchSellerSpecialtiesServerFn(),
  })
}

export function useUpdateSellerSpecialties() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { brandIds: string[], categoryIds: string[] }) =>
      updateSellerSpecialtiesServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-specialties'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      toast.success('Specialties updated successfully')
    },
    onError: () => {
      toast.error('Failed to update specialties')
    },
  })
}

export function useToggleViewMode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (viewMode: boolean) => toggleUserViewModeServerFn({ data: viewMode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      toast.success('View mode updated')
    },
    onError: () => {
      toast.error('Failed to update view mode')
    },
  })
}
