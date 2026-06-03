import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { notificationPreferences, notifications, users } from '@/db/schema'
import { resend } from '@/lib/resend'
import { notificationEvents } from '@/lib/events'

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY as string
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/send-push`

export type NotificationTrigger = {
  userId: string
  type: (typeof notifications.$inferSelect)['type']
  title: string
  message: string
  referenceId?: string
  linkUrl?: string
  metadata?: {
    requestId?: string
    status?: string
    quotesCount?: number
    request?: any
    quoteId?: string
    quoteStatus?: string
  }
  isPriority?: boolean
}

export class NotificationService {
  /**
   * Main entry point to send a notification (In-app + Email)
   */
  static async send(payload: NotificationTrigger, tx?: any) {
    const client = tx || db
    const {
      userId,
      type,
      title,
      message,
      referenceId,
      linkUrl,
      isPriority,
      metadata,
    } = payload

    // 1. Get user preferences
    let prefs = await client.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    })

    // Create default prefs if not exists
    if (!prefs) {
      const [newPrefs] = await client
        .insert(notificationPreferences)
        .values({
          userId,
        })
        .returning()
      prefs = newPrefs
    }

    // 2. Save In-App Notification
    if (prefs.inAppEnabled) {
      const [newNotification] = await client
        .insert(notifications)
        .values({
          userId,
          type,
          title,
          message,
          referenceId,
          linkUrl,
          metadata,
          isPriority: isPriority ?? false,
        })
        .returning()

      // Emit event for SSE
      notificationEvents.emit('notification', newNotification)

      // 2b. Dispatch push notification via Supabase Edge Function
      try {
        await fetch(EDGE_FN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            user_id: userId,
            title,
            message,
            reference_id: referenceId ?? null,
            metadata: metadata ?? null,
          }),
        })
      } catch (pushErr) {
        console.error('[NotificationService] Push dispatch failed:', pushErr)
      }
    }

    // 3. Send Email via Resend (Suspended for now)
    /*
    if (prefs.emailEnabled) {
      // For immediate alerts, we send now
      // For DAILY_DIGEST, we would usually wait for the cron job, 
      // but some triggers are always immediate (like ACCOUNT_APPROVED)
      const isDigestUser = prefs.sellerAlertFrequency === 'DAILY_DIGEST'
      const isCritical = ['ACCOUNT_APPROVED', 'QUOTE_WON', 'QUOTE_STATUS_CHANGE'].includes(type)

      if (!isDigestUser || isCritical) {
        try {
          const userEmail = (await client.query.users.findFirst({ where: eq(users.id, userId) }))?.email || '';
          
          // Resend Sandbox Restriction: 
          // In development/sandbox, you can only send to the email you signed up with.
          // We allow overriding this via an environment variable for easier testing.
          const testEmail = process.env.VITE_RESEND_TEST_EMAIL;
          const finalTo = testEmail || userEmail;

          console.log(`[NotificationService] Attempting to send email to ${finalTo} via Resend...`)
          
          const { renderBaseLayout } = await import('./email-templates')
          
          const html = renderBaseLayout({
            title: title,
            content: message,
            ctaText: linkUrl ? 'View Transaction Details' : undefined,
            ctaUrl: linkUrl ? `https://digital-hub.app${linkUrl}` : undefined
          })

          const response = await resend.emails.send({
            from: 'onboarding@resend.dev', // Strict sandbox requirement
            to: finalTo,
            subject: `[Digital Hub] ${title}`,
            html: html,
          })
          
          console.log('[NotificationService] Resend Response:', response)
        } catch (error) {
          console.error('[NotificationService] Email delivery failure:', error)
          console.error('[NotificationService] Tip: If using Resend Sandbox, the "to" address must be your Resend account email.')
        }
      }
    }
    */
  }

  /**
   * Update preferences for a user
   */
  static async updatePreferences(
    userId: string,
    data: Partial<typeof notificationPreferences.$inferSelect>,
  ) {
    return await db
      .update(notificationPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
  }
}
