import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function insertNotification(data: any) {
  return await db.insert(notifications).values(data);
}

export async function fetchUnreadNotifications(userId: string) {
  return await db.query.notifications.findMany({
    where: and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ),
    orderBy: [desc(notifications.createdAt)],
    limit: 10,
  });
}

export async function markNotificationRead(notificationId: string) {
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsRead(userId: string) {
  await db.update(notifications)
    .set({ isRead: true })
    .where(
      and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
      )
    );
}
