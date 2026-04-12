import { createServerFn } from '@tanstack/react-start'
import { sellerMiddleware } from '@/features/auth/guards/auth'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { sellerBrands, sellerCategories } from '@/db/schema/vendors'
import { z } from 'zod'

export const fetchSellerSpecialtiesServerFn = createServerFn({ method: 'GET' })
  .middleware([sellerMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user?.id as string
    
    const brands = await db.query.sellerBrands.findMany({
      where: eq(sellerBrands.sellerId, userId),
    })
    
    const categories = await db.query.sellerCategories.findMany({
      where: eq(sellerCategories.sellerId, userId),
    })
    
    return {
      brands: brands.map(b => b.brandId),
      categories: categories.map(c => c.categoryId),
    }
  })

export const updateSellerSpecialtiesServerFn = createServerFn({ method: 'POST' })
  .middleware([sellerMiddleware])
  .inputValidator(z.object({
    brandIds: z.array(z.string()),
    categoryIds: z.array(z.string()),
  }))
  .handler(async ({ data, context }) => {
    const userId = context.user?.id as string
    
    await db.transaction(async (tx) => {
      // Clear existing
      await tx.delete(sellerBrands).where(eq(sellerBrands.sellerId, userId))
      await tx.delete(sellerCategories).where(eq(sellerCategories.sellerId, userId))
      
      // Insert new brands
      if (data.brandIds.length > 0) {
        await tx.insert(sellerBrands).values(
          data.brandIds.map(brandId => ({
            sellerId: userId,
            brandId: brandId as any,
          }))
        )
      }
      
      // Insert new categories
      if (data.categoryIds.length > 0) {
        await tx.insert(sellerCategories).values(
          data.categoryIds.map(categoryId => ({
            sellerId: userId,
            categoryId: categoryId as any,
          }))
        )
      }
    })
    
    return { success: true }
  })

