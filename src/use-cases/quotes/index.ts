import type { QuoteInput } from '@/types/quote-schemas'
import { deleteQuote, fetchSellerQuotes, insertQuote, updateQuote, acceptQuoteTransaction, rejectQuoteTransaction, revokeAcceptedQuoteTransaction, unrejectQuoteTransaction } from '@/data-access/quotes'
import { NotificationTriggers } from '@/services/notification-triggers'
import { db } from '@/db'
import { and, eq, ne } from 'drizzle-orm'
import { quotes } from '@/db/schema'

/**
 * Axis Layer 4: Use Cases for Quotes
 */

export async function createQuoteUseCase(data: QuoteInput) {
  let createdQuoteId: string | undefined;

  const result = await db.transaction(async (tx) => {
    try {
      const newQuote = await insertQuote(data, tx)
      
      if (newQuote?.[0]?.id) {
        createdQuoteId = newQuote[0].id
      }

      return { success: true, data: newQuote[0] }
    } catch (error) {
      console.error('Error in createQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: 'Failed to create quote' }
    }
  })

  // Decoupled side-effect: Execute outside the transaction block!
  if (result.success && createdQuoteId) {
    NotificationTriggers.onQuoteCreated(createdQuoteId).catch(console.error)
  }

  return result
}

export async function acceptQuoteUseCase(quoteId: string, requestId: string) {
  return await db.transaction(async (tx) => {
    try {
      await acceptQuoteTransaction(quoteId, requestId, tx)
      
      // Notify the seller
      await NotificationTriggers.onQuoteAccepted(quoteId, tx)

      // Broadcast rejection to other sellers
      const otherQuotes = await tx.query.quotes.findMany({
        where: and(eq(quotes.requestId, requestId), ne(quotes.id, quoteId))
      })
      
      for (const q of otherQuotes) {
        await NotificationTriggers.onQuoteRejected(q.id, tx)
      }

      return { success: true }
    } catch (error) {
      console.error('Error in acceptQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: 'Failed to accept quote' }
    }
  })
}

export async function revokeQuoteUseCase(quoteId: string, requestId: string) {
  return await db.transaction(async (tx) => {
    try {
      await revokeAcceptedQuoteTransaction(quoteId, requestId, tx)
      
      // Notify the seller
      await NotificationTriggers.onQuoteRevoked(quoteId, tx)
      
      return { success: true }
    } catch (error) {
      console.error('Error in revokeQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: 'Failed to revoke quote' }
    }
  })
}

export async function unrejectQuoteUseCase(quoteId: string) {
  return await db.transaction(async (tx) => {
    try {
      const updated = await unrejectQuoteTransaction(quoteId, tx)
      
      // Notify the seller
      await NotificationTriggers.onQuoteUnrejected(quoteId, tx)

      return { success: true, data: updated[0] }
    } catch (error) {
      console.error('Error in unrejectQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: 'Failed to un-reject quote' }
    }
  })
}

export async function rejectQuoteUseCase(quoteId: string) {
  return await db.transaction(async (tx) => {
    try {
      const updated = await rejectQuoteTransaction(quoteId, tx)
      
      // Notify the seller
      await NotificationTriggers.onQuoteRejected(quoteId, tx)
      
      return { success: true, data: updated[0] }
    } catch (error) {
      console.error('Error in rejectQuoteUseCase transaction:', error)
      tx.rollback()
      return { success: false, error: 'Failed to reject quote' }
    }
  })
}

export async function getQuotesBySellerUseCase(sellerId: string) {
  try {
    const quotes = await fetchSellerQuotes(sellerId)
    return { success: true, data: quotes }
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
