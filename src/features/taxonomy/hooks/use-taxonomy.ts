import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTaxonomyServerFn,
  createCategoryServerFn,
  updateCategoryServerFn,
  deleteCategoryServerFn,
  createBrandServerFn,
  updateBrandServerFn,
  deleteBrandServerFn
} from '@/fn/admin'
import { toast } from 'sonner'
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
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CategoryInput) => {
      const res = await createCategoryServerFn({ data: values }) as any
      if (!res.success) throw new Error(res.error || 'Failed to create category')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('Category successfully integrated into taxonomy.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category')
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryInput> }) => {
      const res = await updateCategoryServerFn({ data: { id, data } }) as any
      if (!res.success) throw new Error(res.error || 'Failed to update category')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('Category taxonomy updated.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category')
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCategoryServerFn({ data: id }) as any
      if (!res.success) throw new Error(res.error || 'Failed to delete category')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('Category removed from taxonomy hub.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category')
    }
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: BrandInput) => {
      const res = await createBrandServerFn({ data: values }) as any
      if (!res.success) throw new Error(res.error || 'Failed to create brand cluster')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('Brand cluster created.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create brand cluster')
    }
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BrandInput> }) => {
      const res = await updateBrandServerFn({ data: { id, data } }) as any
      if (!res.success) throw new Error(res.error || 'Failed to update brand cluster')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('Brand cluster updated.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update brand cluster')
    }
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBrandServerFn({ data: id }) as any
      if (!res.success) throw new Error(res.error || 'Failed to delete brand')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyKeys.all })
      toast.success('Brand removed from taxonomy hub.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete brand')
    }
  })
}
