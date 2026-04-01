import { and, eq, ne } from 'drizzle-orm'
import { db } from '@/db'
import { quotes, sparePartRequests } from '@/db/schema'

export async function insertQuote(data: any, tx?: any) {
  const client = tx || db
  return await client
    .insert(quotes)
    .values({
      requestId: data.requestId,
      sellerId: data.sellerId,
      price: data.price,
      condition: data.condition,
      warranty: data.warranty,
      status: 'pending',
    })
    .returning()
}

export async function acceptQuoteTransaction(
  quoteId: string,
  requestId: string,
  tx?: any
) {
  const client = tx || db
  // 1. Accept this specific quote
  await client
    .update(quotes)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(eq(quotes.id, quoteId))

  // 2. Reject all other quotes for this request
  await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(and(eq(quotes.requestId, requestId), ne(quotes.id, quoteId)))

  // 3. Mark request as fulfilled
  await client
    .update(sparePartRequests)
    .set({ status: 'fulfilled', updatedAt: new Date() })
    .where(eq(sparePartRequests.id, requestId))
}

export async function revokeAcceptedQuoteTransaction(
  quoteId: string,
  requestId: string,
  tx?: any
) {
  const client = tx || db
  // 1. Move accepted quote to rejected
  await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(eq(quotes.id, quoteId))

  // 2. Re-open the request
  await client
    .update(sparePartRequests)
    .set({ status: 'open', updatedAt: new Date() })
    .where(eq(sparePartRequests.id, requestId))
}

export async function rejectQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  return await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(eq(quotes.id, quoteId))
    .returning()
}

export async function unrejectQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  return await client
    .update(quotes)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(quotes.id, quoteId))
    .returning()
}

export async function reOpenRequestTransaction(requestId: string, tx?: any) {
  const client = tx || db
  return await client
    .update(sparePartRequests)
    .set({ status: 'open', updatedAt: new Date() })
    .where(eq(sparePartRequests.id, requestId))
    .returning()
}

export async function fetchSellerQuotes(sellerId: string) {
  return await db.query.quotes.findMany({
    where: eq(quotes.sellerId, sellerId),
    orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
    with: {
      request: {
        with: {
          category: true,
        },
      },
    },
  })
}

export async function updateQuote(id: string, data: any) {
  return await db
    .update(quotes)
    .set({
      price: data.price,
      condition: data.condition,
      warranty: data.warranty,
      updatedAt: new Date(),
    })
    .where(eq(quotes.id, id))
    .returning()
}

export async function deleteQuote(id: string) {
  return await db.delete(quotes).where(eq(quotes.id, id)).returning()
}
