import {
  fetchUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/data-access/notifications'
import { users } from '@/db/schema'
import { db } from '@/db'
import { eq } from 'drizzle-orm'

/**
 * Axis Layer 4: Use Cases for Notifications
 */

export async function getUnreadNotificationsUseCase(userId: string) {
  return await fetchUnreadNotifications(userId)
}

export async function markNotificationAsReadUseCase(notificationId: string) {
  return await markNotificationRead(notificationId)
}

export async function markAllAsReadUseCase(userId: string) {
  return await markAllNotificationsRead(userId)
}

import { NotificationService, NotificationTrigger } from '@/services/notification-service'

export async function createNotificationUseCase(data: NotificationTrigger) {
  try {
    return await NotificationService.send(data)
  } catch (error) {
    console.error('Error creating notification use case:', error)
    throw error
  }
}

export async function createSystemNotificationUseCase(
  userId: string,
  title: string,
  message: string,
) {
  return await createNotificationUseCase({
    userId,
    title,
    message,
    type: 'SYSTEM',
  })
}

export async function getSellersUseCase() {
  return await db.query.users.findMany({
    where: eq(users.role, 'seller'),
    columns: { id: true },
  })
}

export async function updateNotificationSettingsUseCase(userId: string, data: any) {
  const { upsertNotificationPreferences } = await import('@/data-access/notifications')
  return await upsertNotificationPreferences(userId, data)
}

export async function getNotificationSettingsUseCase(userId: string) {
  const { fetchNotificationPreferences } = await import('@/data-access/notifications')
  return await fetchNotificationPreferences(userId)
}
