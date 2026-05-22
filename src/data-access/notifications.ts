import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { notificationPreferences, notifications } from '@/db/schema'

export async function insertNotification(data: any) {
  return await db.insert(notifications).values(data)
}

export async function fetchUnreadNotifications(
  userId: string,
  limit = 10,
  offset = 0,
) {
  const condition = and(
    eq(notifications.userId, userId),
    eq(notifications.isRead, false),
  )

  const [items, totalResult] = await Promise.all([
    db.query.notifications.findMany({
      where: condition,
      orderBy: [desc(notifications.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(notifications).where(condition),
  ])

  return { items, total: Number(totalResult[0]?.total ?? 0) }
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    )
}

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
