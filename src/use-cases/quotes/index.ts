import { eq, sql } from 'drizzle-orm'

import type { QuoteInput } from '@/types/quote-schemas'

import {
  acceptQuoteTransaction,
  deleteQuote,
  fetchSellerQuotes,
  insertQuote,
  rejectQuoteTransaction,
  revokeQuoteTransaction,
  unrejectQuoteTransaction,
  updateQuote,
} from '@/data-access/quotes'
import { db } from '@/db'
import {
  creditTransactions,
  quotes,
  sparePartRequests,
  users,
} from '@/db/schema'
import { validateQuoteTransition } from '@/lib/state-machine'
import { NotificationTriggers } from '@/services/notification-triggers'

export async function createQuoteUseCase(data: QuoteInput, sellerId?: string) {
  let createdQuoteId: string | undefined

  try {
    const result = await db.transaction(async (tx) => {
      const request = await tx.query.sparePartRequests.findFirst({
        where: eq(sparePartRequests.id, data.requestId),
      })
      if (
        !request ||
        request.status === 'fulfilled' ||
        request.status === 'cancelled'
      ) {
        throw new Error('Cannot quote on a request that is not open')
      }

      const [seller] = await tx
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, sellerId || ''))

      if (!seller || seller.credits < 1) {
        throw new Error(
          'Insufficient credits. You need at least 1 credit to submit a quote.',
        )
      }

      await tx
        .update(users)
        .set({ credits: sql`${users.credits} - 1` })
        .where(eq(users.id, sellerId || ''))

      const newQuote = await insertQuote({ ...data, sellerId }, tx)

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
      console.error('Error in createQuoteUseCase:', error)
    }
    return { success: false, error: error.message || 'Failed to create quote' }
  }
}

export async function acceptQuoteUseCase(
  quoteId: string,
  userId: string,
  userRole: string,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
        with: { request: true },
      })
      if (!quote) throw new Error('Quote not found')
      if (quote.request.buyerId !== userId && userRole !== 'admin') {
        throw new Error('Forbidden: You do not own this request')
      }
      validateQuoteTransition(quote.status, 'accepted')

      await acceptQuoteTransaction(quoteId, tx)
      return { success: true }
    })

    if (result.success) {
      NotificationTriggers.onQuoteAccepted(quoteId).catch(console.error)
    }
    return result
  } catch (error: any) {
    console.error('Error in acceptQuoteUseCase:', error)
    return { success: false, error: error.message || 'Failed to accept quote' }
  }
}

export async function revokeQuoteUseCase(
  quoteId: string,
  userId: string,
  userRole: string,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
        with: { request: true },
      })
      if (!quote) throw new Error('Quote not found')
      if (quote.request.buyerId !== userId && userRole !== 'admin') {
        throw new Error('Forbidden: You do not own this request')
      }
      validateQuoteTransition(quote.status, 'pending')

      await revokeQuoteTransaction(quoteId, tx)
      return { success: true }
    })

    if (result.success) {
      NotificationTriggers.onQuoteRevoked(quoteId).catch(console.error)
    }
    return result
  } catch (error: any) {
    console.error('Error in revokeQuoteUseCase:', error)
    return { success: false, error: error.message || 'Failed to revoke quote' }
  }
}

export async function rejectQuoteUseCase(
  quoteId: string,
  userId: string,
  userRole: string,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
        with: { request: true },
      })
      if (!quote) throw new Error('Quote not found')
      if (quote.request.buyerId !== userId && userRole !== 'admin') {
        throw new Error('Forbidden: You do not own this request')
      }
      validateQuoteTransition(quote.status, 'rejected')

      const updated = await rejectQuoteTransaction(quoteId, tx)
      return { success: true, data: updated[0] }
    })

    if (result.success) {
      NotificationTriggers.onQuoteRejected(quoteId).catch(console.error)
    }
    return result
  } catch (error: any) {
    console.error('Error in rejectQuoteUseCase:', error)
    return { success: false, error: error.message || 'Failed to reject quote' }
  }
}

export async function unrejectQuoteUseCase(
  quoteId: string,
  userId: string,
  userRole: string,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
        with: { request: true },
      })
      if (!quote) throw new Error('Quote not found')
      if (quote.request.buyerId !== userId && userRole !== 'admin') {
        throw new Error('Forbidden: You do not own this request')
      }
      if (quote.request.status !== 'open') {
        throw new Error(
          'Cannot unreject a quote on a request that is no longer open',
        )
      }
      validateQuoteTransition(quote.status, 'pending')

      const updated = await unrejectQuoteTransaction(quoteId, tx)
      return { success: true, data: updated[0] }
    })

    if (result.success) {
      NotificationTriggers.onQuoteUnrejected(quoteId).catch(console.error)
    }
    return result
  } catch (error: any) {
    console.error('Error in unrejectQuoteUseCase:', error)
    return {
      success: false,
      error: error.message || 'Failed to un-reject quote',
    }
  }
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
