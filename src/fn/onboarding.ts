import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema/auth'

const onboardingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['buyer', 'seller']),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  storeName: z.string().optional(),
  wilaya: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  companyAddress: z.string().optional(),
  commercialRegister: z.string().optional(),
  image: z.string().optional(),
  brandIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
})

export const completeOnboardingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const validated = onboardingSchema.parse(data)
    const request = getRequest()

    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || !session.user) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id

    // Update user record
    await db
      .update(users)
      .set({
        name: validated.name,
        email: validated.email,
        role: validated.role,
        phoneNumber: validated.phoneNumber,
        whatsappNumber: validated.whatsappNumber,
        storeName: validated.storeName,
        wilaya: validated.wilaya,
        city: validated.city,
        address: validated.address,
        companyAddress: validated.companyAddress,
        commercialRegister: validated.commercialRegister,
        image: validated.image,
        account_status: validated.role === 'buyer' ? 'active' : 'waitlisted',
      })
      .where(eq(users.id, userId))

    // Handle seller specialties
    if (validated.role === 'seller') {
      const { updateSellerSpecialties } = await import('@/data-access/vendors')
      await updateSellerSpecialties(
        userId,
        validated.brandIds || [],
        validated.categoryIds || []
      )
    }

    return { success: true }
  })
