import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";

/**
 * Axis Layer 3: Notifications Actions
 */

export const getNotificationsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }: { context: any }) => {
    const { getNotificationsUseCase } = await import("@/use-cases/notifications/index");
    return await getNotificationsUseCase(context.user.id);
  });

export const markNotificationReadServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: any }) => {
    const { markAsReadUseCase } = await import("@/use-cases/notifications/index");
    return await markAsReadUseCase(data.notificationId || data);
  });
