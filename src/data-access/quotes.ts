import { and, eq, isNull, ne } from 'drizzle-orm'
import { db } from '@/db'
import { quotes, sparePartRequests } from '@/db/schema'

export class StateConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StateConflictError'
  }
}

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

  // Guard: only accept pending quotes on open requests
  const [quoteUpdate] = await client
    .update(quotes)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'pending')))
    .returning()

  if (!quoteUpdate) {
    throw new StateConflictError('Quote is not in pending state')
  }

  // Reject all other pending quotes for this request
  await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(and(eq(quotes.requestId, requestId), ne(quotes.id, quoteId), eq(quotes.status, 'pending')))

  // Mark request as fulfilled (only if open)
  const [requestUpdate] = await client
    .update(sparePartRequests)
    .set({ status: 'fulfilled', updatedAt: new Date() })
    .where(and(eq(sparePartRequests.id, requestId), eq(sparePartRequests.status, 'open')))
    .returning()

  if (!requestUpdate) {
    throw new StateConflictError('Request is not in open state')
  }
}

export async function revokeAcceptedQuoteTransaction(
  quoteId: string,
  requestId: string,
  tx?: any
) {
  const client = tx || db

  const [quoteUpdate] = await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'accepted')))
    .returning()

  if (!quoteUpdate) {
    throw new StateConflictError('Quote is not in accepted state')
  }

  const [requestUpdate] = await client
    .update(sparePartRequests)
    .set({ status: 'open', updatedAt: new Date() })
    .where(and(eq(sparePartRequests.id, requestId), eq(sparePartRequests.status, 'fulfilled')))
    .returning()

  if (!requestUpdate) {
    throw new StateConflictError('Request is not in fulfilled state')
  }
}

export async function rejectQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  const [updated] = await client
    .update(quotes)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'pending')))
    .returning()

  if (!updated) {
    throw new StateConflictError('Quote is not in pending state')
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
    throw new StateConflictError('Quote is not in rejected state')
  }
  return [updated]
}

export async function withdrawQuoteTransaction(quoteId: string, tx?: any) {
  const client = tx || db
  const [updated] = await client
    .update(quotes)
    .set({ status: 'withdrawn', updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'pending')))
    .returning()

  if (!updated) {
    const [rejectedQuote] = await client
      .update(quotes)
      .set({ status: 'withdrawn', updatedAt: new Date() })
      .where(and(eq(quotes.id, quoteId), eq(quotes.status, 'rejected')))
      .returning()

    if (!rejectedQuote) {
      throw new StateConflictError('Quote must be in pending or rejected state to withdraw')
    }
    return [rejectedQuote]
  }
  return [updated]
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
