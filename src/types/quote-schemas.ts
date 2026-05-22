import { z } from 'zod'

export const quoteSchema = z.object({
  requestId: z.string(),
  sellerId: z.string(),
  price: z.number().positive('Price must be a positive number'),
  condition: z.enum(['new', 'used']),
  warranty: z.string().optional(),
})

export type QuoteInput = z.infer<typeof quoteSchema>
