import { and, count, eq, gt, sql } from 'drizzle-orm'
import { NotificationService } from './notification-service'
import { db } from '@/db'
import { notifications, quotes, sparePartRequests, users } from '@/db/schema'
import { supabase } from '@/lib/supabase-client'
import { ADMIN_ROUTES, BUYER_ROUTES, SELLER_ROUTES } from '@/lib/routes'

/**
 * Higher-level triggers that map business events to notifications
 */
export class NotificationTriggers {
  // --- Buyer Triggers ---

  static async onQuoteCreated(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true },
    })
    if (!quote || !quote.request) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    const count = Number(rowCount.value)
    const metadata = {
      requestId: quote.requestId,
      status: quote.request.status,
      quotesCount: count,
      partName: quote.request.partName,
      count,
    }

    if (count === 1) {
      await NotificationService.send(
        {
          userId: quote.request.buyerId,
          type: 'FIRST_QUOTE',
          title: 'First Offer Received!',
          message: `Good news! A seller has submitted the first offer for your ${quote.request.partName}. Review it now.`,
          referenceId: quote.requestId,
          linkUrl: BUYER_ROUTES.REQUEST_DETAIL(quote.requestId),
          metadata: { ...metadata, action: 'first_quote' },
        },
        tx,
      )
    } else if (count === 3) {
      await NotificationService.send(
        {
          userId: quote.request.buyerId,
          type: 'MILESTONE_3_QUOTES',
          title: '3 Offers Received!',
          message: `You now have 3 competitive offers for your ${quote.request.partName}. Compare prices and choose the best deal.`,
          referenceId: quote.requestId,
          linkUrl: BUYER_ROUTES.REQUEST_DETAIL(quote.requestId),
          isPriority: true,
          metadata: { ...metadata, action: 'milestone_3' },
        },
        tx,
      )
    } else {
      // Batch NEW_QUOTE notifications within a 30-minute window to avoid spamming
      // the buyer when multiple sellers submit quickly on the same request.
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      const existing = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.userId, quote.request.buyerId),
          eq(notifications.type, 'NEW_QUOTE'),
          eq(notifications.isRead, false),
          sql`(${notifications.metadata}->>'requestId') = ${quote.requestId}`,
          gt(notifications.createdAt, thirtyMinutesAgo),
        ),
      })

      if (existing) {
        await db
          .update(notifications)
          .set({
            message: `You now have ${count} offers on your ${quote.request.partName} request. Open it to compare and choose.`,
            metadata: {
              ...existing.metadata,
              quotesCount: count,
              count,
              action: 'batched',
            },
          })
          .where(eq(notifications.id, existing.id))
      } else {
        await NotificationService.send(
          {
            userId: quote.request.buyerId,
            type: 'NEW_QUOTE',
            title: 'New Offer Received',
            message: `A new offer has been submitted for your ${quote.request.partName}. Open the request to review it.`,
            referenceId: quote.requestId,
            linkUrl: BUYER_ROUTES.REQUEST_DETAIL(quote.requestId),
            metadata: { ...metadata, action: 'new_quote' },
          },
          tx,
        )
      }
    }
  }

  static async onQuoteUpdated(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true },
    })
    if (!quote || !quote.request) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send(
      {
        userId: quote.request.buyerId,
        type: 'QUOTE_STATUS_CHANGE',
        title: 'Offer Price Updated',
        message: `A seller revised their offer for your ${quote.request.partName}. Check the updated price and terms.`,
        referenceId: quote.requestId,
        linkUrl: BUYER_ROUTES.REQUEST_DETAIL(quote.requestId),
        metadata: {
          requestId: quote.requestId,
          status: quote.request.status,
          quotesCount: Number(rowCount.value),
          partName: quote.request.partName,
          action: 'price_updated',
        },
      },
      tx,
    )
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
      with: { request: true },
    })
    if (!quote) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send(
      {
        userId: quote.sellerId,
        type: 'QUOTE_WON',
        title: 'You Won the Deal!',
        message: `Congratulations! The buyer accepted your offer for ${quote.request.partName}. Go to your orders to proceed.`,
        referenceId: quote.requestId,
        linkUrl: SELLER_ROUTES.QUOTES,
        isPriority: true,
        metadata: {
          requestId: quote.requestId,
          status: quote.request.status,
          quotesCount: Number(rowCount.value),
          quoteId: quote.id,
          quoteStatus: 'accepted',
          partName: quote.request.partName,
          action: 'won',
        },
      },
      tx,
    )
  }

  static async onQuoteRejected(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true },
    })
    if (!quote) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send(
      {
        userId: quote.sellerId,
        type: 'QUOTE_STATUS_CHANGE',
        title: 'Offer Not Selected',
        message: `The buyer reviewed all offers for ${quote.request.partName} and chose a different one. Keep bidding on other requests!`,
        referenceId: quote.requestId,
        linkUrl: SELLER_ROUTES.QUOTES,
        metadata: {
          requestId: quote.requestId,
          status: quote.request.status,
          quotesCount: Number(rowCount.value),
          quoteId: quote.id,
          quoteStatus: 'rejected',
          partName: quote.request.partName,
          action: 'rejected',
        },
      },
      tx,
    )
  }

  static async onQuoteUnrejected(quoteId: string, tx?: any) {
    const client = tx || db
    const quote = await client.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true },
    })
    if (!quote) return

    const [rowCount] = await client
      .select({ value: count() })
      .from(quotes)
      .where(eq(quotes.requestId, quote.requestId))

    await NotificationService.send(
      {
        userId: quote.sellerId,
        type: 'QUOTE_STATUS_CHANGE',
        title: 'Offer Back in the Running',
        message: `Good news! The buyer reconsidered and your offer for ${quote.request.partName} is back in consideration.`,
        referenceId: quote.requestId,
        linkUrl: SELLER_ROUTES.QUOTES,
        metadata: {
          requestId: quote.requestId,
          status: quote.request.status,
          quotesCount: Number(rowCount.value),
          quoteId: quote.id,
          quoteStatus: 'pending',
          partName: quote.request.partName,
          action: 'unrejected',
        },
      },
      tx,
    )
  }

  static async onQuoteRevoked(quoteId: string) {
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true },
    })
    if (!quote || !quote.request) return

    await NotificationService.send({
      userId: quote.sellerId,
      type: 'QUOTE_STATUS_CHANGE',
      title: 'Offer Back in Consideration',
      message: `The buyer revoked their acceptance for ${quote.request.partName}. Your offer is back in consideration — the request is still open.`,
      referenceId: quote.requestId,
      linkUrl: SELLER_ROUTES.QUOTES,
      metadata: {
        requestId: quote.requestId,
        quoteId: quote.id,
        quoteStatus: 'pending',
        partName: quote.request.partName,
        action: 'revoked',
      },
    })
  }

  static async onSellerReminder(quoteId: string) {
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
      with: { request: true },
    })
    if (!quote || !quote.request) return

    await NotificationService.send({
      userId: quote.request.buyerId,
      type: 'QUOTE_STATUS_CHANGE',
      title: 'Action Required — Mark Request as Fulfilled',
      message: `The seller is waiting for you to confirm the deal on your request for "${quote.request.partName}". Please mark it as fulfilled once you receive the part.`,
      referenceId: quote.requestId,
      linkUrl: BUYER_ROUTES.REQUEST_DETAIL(quote.requestId),
      metadata: {
        requestId: quote.requestId,
        quoteId: quote.id,
        partName: quote.request.partName,
        action: 'reminder',
      },
    })
  }

  static async onRequestFulfilled(
    requestId: string,
    pendingSellerIds: Array<string> = [],
  ) {
    const request = await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, requestId),
      with: { quotes: true },
    })
    if (!request) return

    const acceptedQuotes =
      request.quotes?.filter((q: any) => q.status === 'accepted') ?? []
    for (const quote of acceptedQuotes) {
      await NotificationService.send({
        userId: quote.sellerId,
        type: 'QUOTE_STATUS_CHANGE',
        title: 'Deal Confirmed!',
        message: `The buyer confirmed the deal for "${request.partName}". The request is now fulfilled — contact them to arrange delivery.`,
        referenceId: requestId,
        linkUrl: SELLER_ROUTES.QUOTES,
        isPriority: true,
        metadata: {
          requestId,
          quoteId: quote.id,
          quoteStatus: 'accepted',
          partName: request.partName,
          action: 'fulfilled_winner',
        },
      })
    }

    for (const sellerId of pendingSellerIds) {
      await NotificationService.send({
        userId: sellerId,
        type: 'QUOTE_STATUS_CHANGE',
        title: 'Request Fulfilled by Another Seller',
        message: `The request for "${request.partName}" was fulfilled by another seller. Your offer was not selected this time — keep bidding on open requests!`,
        referenceId: requestId,
        linkUrl: SELLER_ROUTES.QUOTES,
        metadata: {
          requestId,
          quoteStatus: 'rejected',
          partName: request.partName,
          action: 'fulfilled_loser',
        },
      })
    }
  }

  static async onNewSellerWaitlist(sellerId: string, sellerName: string) {
    const admins = await db.query.users.findMany({
      where: eq(users.role, 'admin'),
    })

    for (const admin of admins) {
      await NotificationService.send({
        userId: admin.id,
        type: 'NEW_SELLER_WAITLIST',
        title: 'New Seller Application',
        message: `${sellerName} has registered and is waiting for account approval.`,
        linkUrl: ADMIN_ROUTES.USERS,
        metadata: { requestId: sellerId, sellerName },
      })
    }
  }

  static async onAccountApproved(userId: string, tx?: any) {
    await NotificationService.send(
      {
        userId,
        type: 'ACCOUNT_APPROVED',
        title: 'Your Store is Live!',
        message:
          'Your seller account has been reviewed and approved by our team. You can now browse open requests and start bidding.',
        linkUrl: SELLER_ROUTES.ROOT,
        isPriority: true,
      },
      tx,
    )
  }

  // --- Admin Triggers ---

  static async onCreditRequestSubmitted(
    sellerId: string,
    sellerName: string,
    credits: number,
  ) {
    const admins = await db.query.users.findMany({
      where: eq(users.role, 'admin'),
    })

    for (const admin of admins) {
      await NotificationService.send({
        userId: admin.id,
        type: 'CREDIT_REQUEST',
        title: 'New Credit Request',
        message: `${sellerName} has requested ${credits} credits.`,
        linkUrl: ADMIN_ROUTES.CREDIT_REQUESTS,
        metadata: { requestId: sellerId, sellerName, credits },
      })
    }
  }

  static async onCreditRequestApproved(sellerId: string, credits: number) {
    await NotificationService.send({
      userId: sellerId,
      type: 'CREDIT_APPROVED',
      title: 'Credits Added to Your Account!',
      message: `Your request was approved! ${credits} credits have been added to your account. You're ready to bid on new requests.`,
      linkUrl: SELLER_ROUTES.ROOT,
      isPriority: true,
      metadata: { credits },
    })
  }

  static async onCreditRequestRejected(
    sellerId: string,
    credits: number,
    adminNote?: string,
  ) {
    await NotificationService.send({
      userId: sellerId,
      type: 'CREDIT_REJECTED',
      title: 'Credit Request Declined',
      message: adminNote
        ? `Your request for ${credits} credits was declined. Reason: ${adminNote}. Please contact support if you have questions.`
        : `Your request for ${credits} credits was declined. Please contact support for more information.`,
      linkUrl: SELLER_ROUTES.ROOT,
      metadata: { credits, adminNote },
    })
  }

  static async onSpamFlagged(requestId: string) {
    // Notify Admin users
    const admins = await db.query.users.findMany({
      where: eq(users.role, 'admin'),
    })

    for (const admin of admins) {
      await NotificationService.send({
        userId: admin.id,
        type: 'SPAM_FLAG',
        title: 'Spam Report — Review Required',
        message: `Request #${requestId.slice(0, 8)} has been flagged as potential spam. Please review and take action.`,
        linkUrl: ADMIN_ROUTES.AUDIT_LOG,
        metadata: { requestIdPrefix: requestId.slice(0, 8) },
      })
    }
  }
}
