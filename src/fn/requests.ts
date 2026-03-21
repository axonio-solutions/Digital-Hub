import { createServerFn } from "@tanstack/react-start";
import { createRequestSchema } from "@/types/request-schemas";
import { authMiddleware } from "@/features/auth/guards/auth";

/**
 * Axis Layer 3: Requests Actions
 */

export const createRequestServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { createRequestUseCase } = await import("@/use-cases/requests/index");
    const validated = createRequestSchema.parse(data);
    return await createRequestUseCase(validated);
  });

export const fetchBuyerRequestsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const userId = ctx.context?.user?.id as string | undefined;
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    const { getBuyerRequestsUseCase } = await import("@/use-cases/requests/index");
    return await getBuyerRequestsUseCase(userId);
  });

export const fetchOpenRequestsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { getOpenRequestsUseCase } = await import("@/use-cases/requests/index");
    return await getOpenRequestsUseCase();
  });

export const fetchAllRequestsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { getAllRequestsUseCase } = await import("@/use-cases/requests/index");
    return await getAllRequestsUseCase();
  });
