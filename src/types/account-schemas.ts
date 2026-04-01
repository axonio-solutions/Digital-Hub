import { z } from 'zod'

export const updateProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  wilaya: z.string().optional(),
  whatsappNumber: z.string().optional(),
  image: z.string().optional(),
  preferredLanguage: z.string().optional(),
  // Seller fields
  storeName: z.string().optional(),
  companyAddress: z.string().optional(),
  commercialRegister: z.string().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const accountActionSchema = z.object({
  userId: z.string().min(1),
})

export type AccountActionInput = z.infer<typeof accountActionSchema>
