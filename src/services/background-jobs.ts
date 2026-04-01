import { 
  sparePartRequests, 
  users, 
} from '@/db/schema'
import { eq, and, lt, sql } from 'drizzle-orm'
import { db } from '@/db'
import { NotificationService } from './notification-service'
import { resend } from '@/lib/resend'

/**
 * Logic for background/recurring tasks (Cron Jobs)
 */
export class BackgroundJobs {
  
  /**
   * 1. DAILY_DIGEST: Send a single email to sellers with "DAILY_DIGEST" preference
   * including all new leads from the last 24 hours.
   */
  static async runDailyDigest() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Find all sellers with DAILY_DIGEST preference
    const digestSellers = await db.query.users.findMany({
      where: eq(users.role, 'seller'),
      with: {
        notificationPreference: true
      }
    })

    for (const seller of digestSellers) {
      if (seller.notificationPreference?.sellerAlertFrequency !== 'DAILY_DIGEST') continue

      // Find new leads for this seller
      // (Simplified: showing all new leads, in real app, we'd filter by specialty)
      const newLeads = await db.query.sparePartRequests.findMany({
        where: and(
          eq(sparePartRequests.status, 'open'),
          lt(sparePartRequests.createdAt, new Date()), // Created in last 24h
          sql`${sparePartRequests.createdAt} > ${twentyFourHoursAgo}`
        )
      })

      if (newLeads.length > 0) {
        await resend.emails.send({
          from: 'Digital Hub <digest@mlila.com>',
          to: seller.email || '',
          subject: `Daily Digest: ${newLeads.length} New Leads Today`,
          html: `
            <h2>New Leads Available</h2>
            <ul>
              ${newLeads.map(l => `<li>${l.partName} for ${l.vehicleBrand}</li>`).join('')}
            </ul>
            <p><a href="${process.env.VITE_APP_URL}/dashboard/marketplace">View all leads</a></p>
          `
        })
      }
    }
  }

  /**
   * 2. ABANDONED_REQUEST: Check for requests older than 48h with no accepted quotes
   * and notify the buyer to close it or check new quotes.
   */
  static async checkAbandonedRequests() {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // Find open requests created before 48h ago
    const oldRequests = await db.query.sparePartRequests.findMany({
      where: and(
        eq(sparePartRequests.status, 'open'),
        lt(sparePartRequests.createdAt, fortyEightHoursAgo)
      ),
      with: {
        quotes: true
      }
    })

    for (const request of oldRequests) {
      // If there's no accepted quote yet
      const hasAccepted = request.quotes.some(q => q.status === 'accepted')
      if (!hasAccepted) {
        await NotificationService.send({
          userId: request.buyerId,
          type: 'ABANDONED_REQUEST',
          title: 'Still looking for parts?',
          message: `Your request for ${request.partName} has been open for 48h. Check available quotes or close it if fulfilled.`,
          referenceId: request.id,
          linkUrl: `/dashboard/requests/${request.id}`,
          isPriority: true,
        })
      }
    }
  }
}
