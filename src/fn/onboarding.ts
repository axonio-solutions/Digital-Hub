import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { sessions, users } from '@/db/schema/auth'

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
    try {
      const validated = onboardingSchema.parse(data)
      const request = getRequest()

      const sessionData = await auth.api.getSession({
        headers: request.headers,
      })

      if (!sessionData || !sessionData.user) {
        throw new Error('Unauthorized — no active session')
      }

      const userId = sessionData.user.id

      // Update user record
      const newStatus = validated.role === 'buyer' ? 'active' : 'waitlisted'
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
          account_status: newStatus,
        })
        .where(eq(users.id, userId))

      // Bust the better-auth cookieCache by touching the session's updatedAt
      // This forces getSession() to re-read user data from the DB on the next request
      await db
        .update(sessions)
        .set({ updatedAt: new Date() })
        .where(eq(sessions.userId, userId))

      // Handle seller specialties
      if (validated.role === 'seller') {
        const { updateSellerSpecialties } =
          await import('@/data-access/vendors')
        await updateSellerSpecialties(
          userId,
          validated.brandIds || [],
          validated.categoryIds || [],
        )
      }

      return {
        success: true,
        account_status: newStatus,
      }
    } catch (err: any) {
      console.error('[completeOnboardingFn] Error:', err)
      throw new Error(err?.message || 'Onboarding failed on server')
    }
  })
