import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchSellerSpecialtiesServerFn,
  updateSellerSpecialtiesServerFn,
} from '@/fn/vendors'
import { useToast } from '@/hooks/use-toast'

export function useSellerSpecialties() {
  return useQuery({
    queryKey: ['seller-specialties'],
    queryFn: () => fetchSellerSpecialtiesServerFn(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSellerSpecialties() {
  const queryClient = useQueryClient()
  const { toast } = useToast('vendors')
  return useMutation({
    mutationFn: (data: { brandIds: string[], categoryIds: string[] }) =>
      updateSellerSpecialtiesServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-specialties'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      toast.success('toasts.specialties_updated')
    },
    onError: () => {
      toast.error('toasts.specialties_error')
    },
  })
}
