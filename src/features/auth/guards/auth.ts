import { createMiddleware } from '@tanstack/react-start'
import { getRequest, setResponseStatus } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema/auth'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const req = getRequest()

  const session = await auth.api.getSession({
    headers: req?.headers,
  })

  if (!session) {
    setResponseStatus(401)
    throw new Error('Unauthorized')
  }

  // Fetch fresh user data from DB to bypass better-auth's cookieCache
  // This ensures role/status checks use current values (critical after onboarding)
  const [freshUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))

  return next({
    context: {
      user: freshUser ?? session.user,
      session: session.session,
    },
  })
})

export const optionalAuthMiddleware = createMiddleware().server(
  async ({ next }) => {
    const req = getRequest()

    const session = await auth.api.getSession({
      headers: req?.headers,
    })

    return next({
      context: {
        user: session?.user ?? null,
        session: session?.session ?? null,
      },
    })
  },
)
import { type User } from '@/lib/auth'

export const adminMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const user = context.user as User
    if (user?.role !== 'admin') {
      setResponseStatus(403)
      throw new Error('Forbidden: Admin access required')
    }

    return next()
  })

export const sellerMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const user = context.user as User
    if (user?.role !== 'seller' && user?.role !== 'admin') {
      setResponseStatus(403)
      throw new Error('Forbidden: Seller access required')
    }

    return next()
  })

export const buyerMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const user = context.user as User
    if (user?.role !== 'buyer' && user?.role !== 'admin') {
      setResponseStatus(403)
      throw new Error('Forbidden: Buyer access required')
    }

    return next()
  })
