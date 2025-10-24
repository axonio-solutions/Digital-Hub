import { z } from "zod"

// Digital product schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  status: z.string(),
  platform: z.string(),
})

export type Product = z.infer<typeof productSchema>
