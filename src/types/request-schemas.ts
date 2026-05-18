import { z } from 'zod'

export const createRequestSchema = z.object({
  buyerId: z.string().min(1, 'Buyer ID is required'),
  partName: z.string().min(2, 'Part name must be at least 2 characters'),
  vehicleBrand: z.string().min(1, 'Vehicle brand is required'),
  modelYear: z.string().min(1, 'Model and Year are required'),
  categoryId: z.string().uuid('Category ID is required').optional(),
  brandId: z.string().uuid('Brand ID is required').optional(),
  oemNumber: z.string().optional(),
  notes: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  status: z.string().optional(),
})

export const requestIdSchema = z.string().min(1, 'Request ID is required')

export const updateRequestSchema = z.object({
  id: z.string().min(1),
  payload: createRequestSchema.partial(),
})

export const requestFormSchema = z.object({
  partName: z.string().min(2, 'Part name must be at least 2 characters'),
  description: z.string().optional(),
  vehicleBrand: z.string().min(1, 'Vehicle brand is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  modelYear: z.string().min(1, 'Model year is required'),
  vinNumber: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
})

export type RequestFormData = z.infer<typeof requestFormSchema>

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
