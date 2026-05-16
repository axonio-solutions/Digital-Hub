import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTaxonomyServerFn,
  createCategoryServerFn,
  updateCategoryServerFn,
  deleteCategoryServerFn,
  createBrandServerFn,
  updateBrandServerFn,
  deleteBrandServerFn
} from '@/fn/admin'
import { useToast } from '@/hooks/use-toast'
import type { CategoryInput, BrandInput } from '../validations/taxonomy'

export const taxonomyKeys = {
  all: ['admin-taxonomy'] as const,
}

export function useTaxonomy() {
  return useQuery({
    queryKey: taxonomyKeys.all,
    queryFn: async () => {
      const res = await getTaxonomyServerFn() as any
      if (!res.success) throw new Error(res.error || 'Failed to fetch taxonomy')
      return res.data
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast('dashboard/taxonomy')
  return useMutation({
    mutationFn: async (values: CategoryInput) => {
      const res = await createCategoryServerFn({ data: values }) as any
      if (!res.success) throw new Error(res.error || 'Failed to create category')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('toasts.category_created')
    },
    onError: () => {
      toast.error('toasts.category_create_error')
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast('dashboard/taxonomy')
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryInput> }) => {
      const res = await updateCategoryServerFn({ data: { id, data } }) as any
      if (!res.success) throw new Error(res.error || 'Failed to update category')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('toasts.category_updated')
    },
    onError: () => {
      toast.error('toasts.category_update_error')
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast('dashboard/taxonomy')
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCategoryServerFn({ data: id }) as any
      if (!res.success) throw new Error(res.error || 'Failed to delete category')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('toasts.category_deleted')
    },
    onError: () => {
      toast.error('toasts.category_delete_error')
    }
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast('dashboard/taxonomy')
  return useMutation({
    mutationFn: async (values: BrandInput) => {
      const res = await createBrandServerFn({ data: values }) as any
      if (!res.success) throw new Error(res.error || 'Failed to create brand cluster')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('toasts.brand_created')
    },
    onError: () => {
      toast.error('toasts.brand_create_error')
    }
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast('dashboard/taxonomy')
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BrandInput> }) => {
      const res = await updateBrandServerFn({ data: { id, data } }) as any
      if (!res.success) throw new Error(res.error || 'Failed to update brand cluster')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('toasts.brand_updated')
    },
    onError: () => {
      toast.error('toasts.brand_update_error')
    }
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast('dashboard/taxonomy')
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBrandServerFn({ data: id }) as any
      if (!res.success) throw new Error(res.error || 'Failed to delete brand')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('toasts.brand_deleted')
    },
    onError: () => {
      toast.error('toasts.brand_delete_error')
    }
  })
}
