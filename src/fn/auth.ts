import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import type { User } from '@/lib/auth'
import { auth } from '@/lib/auth'
import { loginSchema, registerSchema } from '@/types/auth-schemas'

/**
 * Axis Layer 3: Auth Actions
 */

export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const data = await auth.api.getSession({
    headers: request?.headers,
    query: {
      disableCookieCache: true,
    },
  })

  if (!data || !data?.user) {
    return null
  }

  // Explicitly cast to include additional fields from our schema
  return {
    ...data.user,
  } as User
})

export const loginFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const validated = loginSchema.parse(data)
    const response = await auth.api.signInEmail({
      body: {
        email: validated.email,
        password: validated.password,
        callbackURL: '/dashboard',
      },
      asResponse: true,
    })
    return response
  })

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const validated = registerSchema.parse(data)
    const { user } = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
        callbackURL: '/dashboard',
      },
    })

    if (!user) {
      return { success: false, error: 'Registration failed' }
    }

    return { success: true, userId: user.id }
  })

export const registerSellerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    // 1. Sign up user via Better Auth
    const { user } = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: '/dashboard',
      },
    })

    if (!user) throw new Error('Registration failed')

    // 2. Update Enhanced Profile (Role + Status + Business Data)
    const { updateUserMetadata } = await import('@/data-access/users')
    await updateUserMetadata(user.id, {
      role: 'seller',
      account_status: 'waitlisted',
      phoneNumber: data.phoneNumber,
      whatsappNumber: data.whatsappNumber,
      storeName: data.storeName,
      companyAddress: data.companyAddress,
      commercialRegister: data.commercialRegister,
      wilaya: data.wilaya,
      city: data.city,
    })

    // 3. Persist Market Specialties (Junction Tables)
    const { updateSellerSpecialties } = await import('@/data-access/vendors')
    await updateSellerSpecialties(user.id, data.brandIds || [], data.categoryIds || [])

    return { success: true, userId: user.id }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const request = getRequest()
  await auth.api.signOut({
    headers: request.headers,
  })
  return { success: true }
})

// Legacy exports for backwards compatibility
export const loginServerFn = loginFn
export const registerServerFn = registerFn
export const logoutServerFn = logoutFn
export const getSession = getUser
export const getUserSessionServerFn = getUser
