import { count } from 'drizzle-orm'
import { db } from '@/db'
import { quotes, sparePartRequests, users } from '@/db/schema'

export async function fetchGlobalMetrics() {
  const userCount = await db.select({ value: count() }).from(users)
  const quoteCount = await db.select({ value: count() }).from(quotes)
  const requestCount = await db
    .select({ value: count() })
    .from(sparePartRequests)

  return {
    users: userCount[0].value,
    quotes: quoteCount[0].value,
    requests: requestCount[0].value,
  }
}
