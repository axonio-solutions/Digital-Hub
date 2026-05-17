import { and, eq, ne, sql } from 'drizzle-orm'

import type { QuoteInput } from '@/types/quote-schemas'

import {
  acceptQuoteTransaction,
  deleteQuote,
  fetchSellerQuotes,
  insertQuote,
  rejectQuoteTransaction,
  revokeAcceptedQuoteTransaction,
  unrejectQuoteTransaction,
  updateQuote,
  withdrawQuoteTransaction,
} from '@/data-access/quotes'
import { db } from '@/db'
import { creditTransactions, quotes, sparePartRequests, users } from '@/db/schema'
import { validateQuoteTransition, validateRequestTransition } from '@/lib/state-machine'
import { NotificationTriggers } from '@/services/notification-triggers'

/**
 * Axis Layer 4: Use Cases for Quotes
 */

export async function createQuoteUseCase(data: QuoteInput, sellerId?: string) {
  let createdQuoteId: string | undefined;

  try {
    const result = await db.transaction(async (tx) => {
      const request = await tx.query.sparePartRequests.findFirst({
        where: eq(sparePartRequests.id, data.requestId),
      })
      if (!request || request.status !== 'open') {
        throw new Error('Cannot quote on a non-open request')
      }

      const [seller] = await tx
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, sellerId || ''))

      if (!seller || seller.credits < 1) {
        throw new Error('Insufficient credits. You need at least 1 credit to submit a quote.')
      }

      await tx
        .update(users)
        .set({ credits: sql`${users.credits} - 1` })
        .where(eq(users.id, sellerId || ''))

      const newQuote = await insertQuote(data, tx)

      if (newQuote?.[0]?.id) {
        createdQuoteId = newQuote[0].id

        await tx.insert(creditTransactions).values({
          sellerId: sellerId || '',
          amount: -1,
          type: 'quote_spent',
          referenceId: newQuote[0].id,
          description: `Quote submission — ${request.partName}`,
        })
      }

      return { success: true, data: newQuote[0] }
    })

    if (result.success && createdQuoteId) {
      NotificationTriggers.onQuoteCreated(createdQuoteId).catch(console.error)
    }

    return result
  } catch (error: any) {
    if (!error.message?.toLowerCase().includes('credit')) {
      console.error('Error in createQuoteUseCase transaction:', error)
    }
    return { success: false, error: error.message || 'Failed to create quote' }
  }
}

export async function acceptQuoteUseCase(quoteId: string, requestId: string) {
  return await db.transaction(async (tx) => {
    try {
      const request = await tx.query.sparePartRequests.findFirst({
        where: eq(sparePartRequests.id, requestId),
      })
      if (!request) {
        tx.rollback()
        return { success: false, error: 'Request not found' }
      }
      validateRequestTransition(request.status, 'fulfilled')

      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
      })
      if (!quote) {
        tx.rollback()
        return { success: false, error: 'Quote not found' }
      }
      validateQuoteTransition(quote.status, 'accepted')

      await acceptQuoteTransaction(quoteId, requestId, tx)
      
      await NotificationTriggers.onQuoteAccepted(quoteId, tx)

      const otherQuotes = await tx.query.quotes.findMany({
        where: and(eq(quotes.requestId, requestId), ne(quotes.id, quoteId))
      })
      
      for (const q of otherQuotes) {
        await NotificationTriggers.onQuoteRejected(q.id, tx)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error in acceptQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: error.message || 'Failed to accept quote' }
    }
  })
}

export async function revokeQuoteUseCase(quoteId: string, requestId: string) {
  return await db.transaction(async (tx) => {
    try {
      const request = await tx.query.sparePartRequests.findFirst({
        where: eq(sparePartRequests.id, requestId),
      })
      if (!request) {
        tx.rollback()
        return { success: false, error: 'Request not found' }
      }

      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
      })
      if (!quote) {
        tx.rollback()
        return { success: false, error: 'Quote not found' }
      }

      if (request.status === 'open' && quote.status !== 'accepted') {
        return { success: true }
      }

      validateRequestTransition(request.status, 'open')
      validateQuoteTransition(quote.status, 'pending')

      await revokeAcceptedQuoteTransaction(quoteId, requestId, tx)
      
      await NotificationTriggers.onQuoteRevoked(quoteId, tx)
      
      return { success: true }
    } catch (error: any) {
      console.error('Error in revokeQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: error.message || 'Failed to revoke quote' }
    }
  })
}

export async function unrejectQuoteUseCase(quoteId: string) {
  return await db.transaction(async (tx) => {
    try {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
      })
      if (!quote) {
        tx.rollback()
        return { success: false, error: 'Quote not found' }
      }
      validateQuoteTransition(quote.status, 'pending')

      const updated = await unrejectQuoteTransaction(quoteId, tx)
      
      await NotificationTriggers.onQuoteUnrejected(quoteId, tx)

      return { success: true, data: updated[0] }
    } catch (error: any) {
      console.error('Error in unrejectQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: error.message || 'Failed to un-reject quote' }
    }
  })
}

export async function rejectQuoteUseCase(quoteId: string) {
  return await db.transaction(async (tx) => {
    try {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
      })
      if (!quote) {
        tx.rollback()
        return { success: false, error: 'Quote not found' }
      }
      validateQuoteTransition(quote.status, 'rejected')

      const updated = await rejectQuoteTransaction(quoteId, tx)
      
      await NotificationTriggers.onQuoteRejected(quoteId, tx)
      
      return { success: true, data: updated[0] }
    } catch (error: any) {
      console.error('Error in rejectQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: error.message || 'Failed to reject quote' }
    }
  })
}

export async function getQuotesBySellerUseCase(sellerId: string) {
  try {
    const sellerQuotes = await fetchSellerQuotes(sellerId)
    return { success: true, data: sellerQuotes }
  } catch (error) {
    console.error('Error in getQuotesBySellerUseCase:', error)
    return { success: false, error: 'Failed to fetch quotes' }
  }
}

export async function withdrawQuoteUseCase(id: string) {
  try {
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, id),
    })
    if (!quote) return { success: false, error: 'Quote not found' }
    validateQuoteTransition(quote.status, 'withdrawn')
    const withdrawn = await withdrawQuoteTransaction(id)
    return { success: true, data: withdrawn[0] }
  } catch (error: any) {
    console.error('Error in withdrawQuoteUseCase:', error)
    return { success: false, error: error.message || 'Failed to withdraw quote' }
  }
}

export async function deleteQuoteUseCase(id: string) {
  try {
    const deleted = await deleteQuote(id)
    return { success: true, data: deleted[0] }
  } catch (error) {
    console.error('Error in deleteQuoteUseCase:', error)
    return { success: false, error: 'Failed to delete quote' }
  }
}

export async function updateQuoteUseCase(id: string, data: QuoteInput) {
  try {
    const updated = await updateQuote(id, data)
    
    if (updated?.[0]?.id) {
       await NotificationTriggers.onQuoteUpdated(updated[0].id)
    }
    
    return { success: true, data: updated[0] }
  } catch (error) {
    console.error('Error in updateQuoteUseCase:', error)
    return { success: false, error: 'Failed to update quote' }
  }
}
