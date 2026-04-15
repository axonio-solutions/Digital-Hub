import { createServerFn } from '@tanstack/react-start'
import { count, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { quotes, sparePartRequests, users } from '@/db/schema'

export const getLandingStatsServerFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const [sellersResult, requestsResult, quotesResult] = await Promise.all([
    db.select({ value: count() }).from(users).where(eq(users.role, 'seller')),
    db.select({ value: count() }).from(sparePartRequests),
    db.select({ value: count() }).from(quotes),
  ])

  return {
    activeSellers: sellersResult[0].value,
    partsSourced: requestsResult[0].value,
    totalQuotes: quotesResult[0].value,
  }
})
