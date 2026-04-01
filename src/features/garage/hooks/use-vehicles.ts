import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addVehicleServerFn,
  getVehiclesServerFn,
  removeVehicleServerFn,
} from '@/fn/vehicles'

export const vehicleKeys = {
  all: ['vehicles'] as const,
  user: (userId: string) => [...vehicleKeys.all, userId] as const,
}

export function useVehicles(userId: string) {
  return useQuery({
    queryKey: vehicleKeys.user(userId),
    queryFn: async () => {
      const res = await getVehiclesServerFn({ data: userId })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: !!userId,
  })
}

export function useAddVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await addVehicleServerFn({ data })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.user(variables.userId),
      })
    },
  })
}

export function useRemoveVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; userId: string }) => {
      const res = (await removeVehicleServerFn({ data })) as any
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.user(variables.userId),
      })
    },
  })
}
