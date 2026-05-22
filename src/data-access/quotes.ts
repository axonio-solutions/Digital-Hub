import { and, eq, isNull } from 'drizzle-orm'
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

export async function acceptQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  const [updated] = await client
    .update(quotes)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'pending')))
    .returning()

  if (!updated) {
    throw new Error('Quote is not in pending state')
  }
  return [updated]
}

export async function rejectQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  const [updated] = await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'pending')))
    .returning()

  if (!updated) {
    // Try from accepted state (buyer ends discussion)
    const [fromAccepted] = await client
      .update(quotes)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'accepted')))
      .returning()

    if (!fromAccepted) {
      throw new Error('Quote must be in pending or accepted state to reject')
    }
    return [fromAccepted]
  }
  return [updated]
}

export async function unrejectQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  const [updated] = await client
    .update(quotes)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'rejected')))
    .returning()

  if (!updated) {
    throw new Error('Quote is not in rejected state')
  }
  return [updated]
}

export async function revokeQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  const [updated] = await client
    .update(quotes)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'accepted')))
    .returning()

  if (!updated) {
    throw new Error('Quote is not in accepted state')
  }
  return [updated]
}

export async function fulfillRequestTransaction(requestId: string, tx?: any) {
  const client = tx || db

  const [requestUpdate] = await client
    .update(sparePartRequests)
    .set({ status: 'fulfilled', updatedAt: new Date() })
    .where(
      and(
        eq(sparePartRequests.id, requestId),
        eq(sparePartRequests.status, 'open'),
      ),
    )
    .returning()

  if (!requestUpdate) {
    throw new Error('Request is not in open state')
  }

  // Auto-reject all remaining pending quotes
  await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(and(eq(quotes.requestId, requestId), eq(quotes.status, 'pending')))

  return requestUpdate
}

export async function fetchSellerQuotes(sellerId: string) {
  return await db.query.quotes.findMany({
    where: and(eq(quotes.sellerId, sellerId), isNull(quotes.deletedAt)),
    orderBy: (q, { desc }) => [desc(q.createdAt)],
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
    .where(and(eq(quotes.id, id), eq(quotes.status, 'pending')))
    .returning()
}

export async function deleteQuote(id: string) {
  return await db
    .update(quotes)
    .set({ deletedAt: new Date() })
    .where(eq(quotes.id, id))
    .returning()
}

export async function fetchSellerQuoteForRequest(
  requestId: string,
  sellerId: string,
) {
  return await db.query.quotes.findFirst({
    where: and(
      eq(quotes.requestId, requestId),
      eq(quotes.sellerId, sellerId),
      isNull(quotes.deletedAt),
    ),
  })
}

export async function fetchAnonymousQuotesQuery(requestId: string) {
  return await db.query.quotes.findMany({
    where: and(eq(quotes.requestId, requestId), isNull(quotes.deletedAt)),
    columns: {
      id: true,
      status: true,
      condition: true,
      warranty: true,
      sellerId: true,
    },
  })
}
