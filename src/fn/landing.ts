import { createServerFn } from '@tanstack/react-start'
import { count, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { creditPackages, quotes, sparePartRequests, users } from '@/db/schema'

export const getLandingStatsServerFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const [sellersResult, buyersResult, requestsResult, quotesResult] =
    await Promise.all([
      db.select({ value: count() }).from(users).where(eq(users.role, 'seller')),
      db.select({ value: count() }).from(users).where(eq(users.role, 'buyer')),
      db.select({ value: count() }).from(sparePartRequests),
      db.select({ value: count() }).from(quotes),
    ])

  return {
    activeSellers: sellersResult[0].value,
    activeBuyers: buyersResult[0].value,
    partsSourced: requestsResult[0].value,
    totalQuotes: quotesResult[0].value,
  }
})

export const getCreditPackagesServerFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const packages = await db
    .select()
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))
    .orderBy(desc(creditPackages.credits))

  return packages
})
