import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";
import { type User } from "@/lib/auth";

/**
 * Axis Layer 3: Admin Actions
 */

export const getAllUsersServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const user = ctx.context.user as User;
    // Audit check: ensure user is admin if needed
    if (user?.role !== "admin") {
      throw new Error("Forbidden: Admin access required");
    }
    const { getAllUsersUseCase } = await import("@/use-cases/admin/index");
    return await getAllUsersUseCase();
  });

export const getAdminMetricsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const user = ctx.context.user as User;
    if (user?.role !== "admin") {
      throw new Error("Forbidden");
    }
    const { getAdminMetricsUseCase } = await import("@/use-cases/admin/index");
    return await getAdminMetricsUseCase();
  });

export const getBuyerAnalyticsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const user = ctx.context.user as User;
    if (user?.role !== "admin") {
      throw new Error("Forbidden");
    }
    const { getBuyerAnalyticsUseCase } = await import("@/use-cases/admin/index");
    return await getBuyerAnalyticsUseCase();
  });

export const getSellerAnalyticsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const user = ctx.context.user as User;
    if (user?.role !== "admin") {
      throw new Error("Forbidden");
    }
    const { getSellerAnalyticsUseCase } = await import("@/use-cases/admin/index");
    return await getSellerAnalyticsUseCase();
  });

export const getAdvancedSystemMetricsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const user = ctx.context.user as User;
    if (user?.role !== "admin") {
      throw new Error("Forbidden");
    }
    const { getAdvancedSystemMetricsUseCase } = await import("@/use-cases/admin/index");
    return await getAdvancedSystemMetricsUseCase();
  });

