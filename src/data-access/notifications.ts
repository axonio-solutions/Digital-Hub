import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { notifications } from '@/db/schema'

export async function insertNotification(data: any) {
  return await db.insert(notifications).values(data)
}

export async function fetchUnreadNotifications(userId: string) {
  return await db.query.notifications.findMany({
    where: and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false),
    ),
    orderBy: [desc(notifications.createdAt)],
    limit: 10,
  })
}

export async function markNotificationRead(notificationId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId))
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    )
}

import { notificationPreferences } from '@/db/schema'

export async function fetchNotificationPreferences(userId: string) {
  return await db.query.notificationPreferences.findFirst({
    where: eq(notificationPreferences.userId, userId),
  })
}

export async function upsertNotificationPreferences(userId: string, data: any) {
  return await db
    .insert(notificationPreferences)
    .values({
      userId,
      ...data,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning()
}
