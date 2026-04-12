import { db } from '@/db'
import { 
  quotes, 
  sparePartRequests, 
  users,
} from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { NotificationService } from './notification-service'
import { supabase } from '@/lib/supabase-client'

/**
 * Higher-level triggers that map business events to notifications
 */
export class NotificationTriggers {
  
  // --- Buyer Triggers ---

  static async onQuoteCreated(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true }
    })
    if (!quote || !quote.request) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    const metadata = {
      requestId: quote.requestId,
      status: quote.request.status,
      quotesCount: Number(rowCount.value),
    }

    if (rowCount.value === 1) {
      await NotificationService.send({
        userId: quote.request.buyerId,
        type: 'FIRST_QUOTE',
        title: 'First Quote Received!',
        message: `Good news! Your first offer for ${quote.request.partName} is here.`,
        referenceId: quote.requestId,
        linkUrl: `/dashboard/requests/${quote.requestId}`,
        metadata,
      }, tx)
    } else if (rowCount.value === 3) {
      await NotificationService.send({
        userId: quote.request.buyerId,
        type: 'MILESTONE_3_QUOTES',
        title: '3 Quotes Milestone!',
        message: `You now have 3 competitive quotes for your ${quote.request.partName}. Time to compare!`,
        referenceId: quote.requestId,
        linkUrl: `/dashboard/requests/${quote.requestId}`,
        isPriority: true,
        metadata,
      }, tx)
    } else {
      await NotificationService.send({
        userId: quote.request.buyerId,
        type: 'NEW_QUOTE',
        title: 'New Offer Received',
        message: `A seller has submitted a new offer for ${quote.request.partName}.`,
        referenceId: quote.requestId,
        linkUrl: `/dashboard/requests/${quote.requestId}`,
        metadata,
      }, tx)
    }
  }

  static async onQuoteUpdated(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true }
    })
    if (!quote || !quote.request) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send({
      userId: quote.request.buyerId,
      type: 'QUOTE_STATUS_CHANGE',
      title: 'Quote Updated',
      message: `A seller has updated their quote for ${quote.request.partName}.`,
      referenceId: quote.requestId,
      linkUrl: `/dashboard/requests/${quote.requestId}`,
      metadata: {
        requestId: quote.requestId,
        status: quote.request.status,
        quotesCount: Number(rowCount.value),
      },
    }, tx)
  }

  // --- Seller Triggers ---

  static async onNewRequest(requestId: string, tx?: any) {
    const client = tx || db
    const request = await client.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, requestId),
    })
    if (!request) return

    // BROADCAST: Send a single lightweight event to the public marketplace channel
    // Active sellers listening on the board will receive this instantly.
    await supabase.channel('public-marketplace').send({
      type: 'broadcast',
      event: 'NEW_REQUEST',
      payload: {
        id: request.id,
        partName: request.partName,
        vehicleBrand: request.vehicleBrand,
        vehicleModel: request.vehicleModel,
        vehicleYear: request.vehicleYear,
        status: request.status,
        createdAt: request.createdAt,
        deadline: request.deadline,
        buyerId: request.buyerId,
        categoryId: request.categoryId,
        brandId: request.brandId,
      },
    })
  }

  static async onQuoteAccepted(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true }
    })
    if (!quote) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send({
      userId: quote.sellerId,
      type: 'QUOTE_WON',
      title: 'You Won the Deal!',
      message: `Your quote for ${quote.request.partName} was accepted. Check your orders.`,
      referenceId: quote.requestId,
      linkUrl: `/dashboard/orders`,
      isPriority: true,
      metadata: {
        requestId: quote.requestId,
        status: quote.request.status,
        quotesCount: Number(rowCount.value),
        // Seller specific quote tracking
        quoteId: quote.id,
        quoteStatus: 'accepted'
      },
    }, tx)
  }

  static async onQuoteRejected(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true }
    })
    if (!quote) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send({
      userId: quote.sellerId,
      type: 'QUOTE_STATUS_CHANGE',
      title: 'Offer Updated',
      message: `Your offer for ${quote.request.partName} was not selected.`,
      referenceId: quote.requestId,
      linkUrl: `/dashboard/quotes`,
      metadata: {
        requestId: quote.requestId,
        status: quote.request.status,
        quotesCount: Number(rowCount.value),
        quoteId: quote.id,
        quoteStatus: 'rejected'
      },
    }, tx)
  }

  static async onQuoteUnrejected(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true }
    })
    if (!quote) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send({
      userId: quote.sellerId,
      type: 'QUOTE_STATUS_CHANGE',
      title: 'Offer Restored',
      message: `Your offer for ${quote.request.partName} is back in consideration.`,
      referenceId: quote.requestId,
      linkUrl: `/dashboard/quotes`,
      metadata: {
        requestId: quote.requestId,
        status: quote.request.status,
        quotesCount: Number(rowCount.value),
        quoteId: quote.id,
        quoteStatus: 'pending'
      },
    }, tx)
  }

  static async onQuoteRevoked(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true }
    })
    if (!quote) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send({
      userId: quote.sellerId,
      type: 'QUOTE_STATUS_CHANGE',
      title: 'Order Status Change',
      message: `The acceptance of your offer for ${quote.request.partName} has been revoked.`,
      referenceId: quote.requestId,
      linkUrl: `/dashboard/quotes`,
      metadata: {
        requestId: quote.requestId,
        status: quote.request.status,
        quotesCount: Number(rowCount.value),
        quoteId: quote.id,
        quoteStatus: 'revoked'
      },
    }, tx)
  }

  static async onAccountApproved(userId: string, tx?: any) {
    await NotificationService.send({
      userId,
      type: 'ACCOUNT_APPROVED',
      title: 'Store Approved!',
      message: 'Your seller account has been reviewed and approved. You can now start bidding!',
      linkUrl: `/dashboard/seller`,
      isPriority: true,
    }, tx)
  }

  // --- Admin Triggers ---

  static async onSpamFlagged(requestId: string) {
    // Notify Admin users
    const admins = await db.query.users.findMany({
      where: eq(users.role, 'admin')
    })

    for (const admin of admins) {
      await NotificationService.send({
        userId: admin.id,
        type: 'SPAM_FLAG',
        title: 'Spam Alert',
        message: `Request #${requestId.slice(0, 8)} has been flagged as spam.`,
        linkUrl: `/admin/dashboard/requests`,
      })
    }
  }
}
