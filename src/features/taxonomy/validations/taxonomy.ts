import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().nullable().optional(),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
})

export const brandSchema = z.object({
  brand: z.string().min(2, 'Brand must be at least 2 characters'),
  clusterOrigin: z.string().min(2, 'Origin must be at least 2 characters'),
  clusterRegion: z.string().min(2, 'Region must be at least 2 characters'),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type BrandInput = z.infer<typeof brandSchema>
