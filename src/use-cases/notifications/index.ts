import { fetchUnreadNotifications, markNotificationRead } from "@/data-access/notifications";
import { createServerFn } from "@tanstack/react-start";

/**
 * Axis Layer 4: Use Cases for Notifications
 */

export async function getNotificationsUseCase(userId: string) {
    return await fetchUnreadNotifications(userId);
}

export async function markAsReadUseCase(notificationId: string) {
    return await markNotificationRead(notificationId);
}

export const getUserNotificationsServerFn = createServerFn({ method: "GET" })
    // @ts-ignore
    .handler(async ({ context }) => {
        const userId = (context as any)?.user?.id as string | undefined;
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }
        return await getNotificationsUseCase(userId);
    });

export const markNotificationReadServerFn = createServerFn({ method: "POST" })
    .handler(async ({ data }: { data: any }) => {
        return await markAsReadUseCase(data.notificationId);
    });
