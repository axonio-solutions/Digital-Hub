// src/fn/quotes.ts
import { createServerFn } from "@tanstack/react-start";
import { quoteSchema, acceptQuoteSchema } from "@/types/quote-schemas";
import { authMiddleware } from "@/features/auth/guards/auth";

/**
 * Axis Layer 3: Quotes Actions
 */

export const createQuoteServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { createQuoteUseCase } = await import("@/use-cases/quotes/index");
    const validated = quoteSchema.parse(data);
    return await createQuoteUseCase(validated);
  });

export const getSellerQuotesServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getQuotesBySellerUseCase } = await import("@/use-cases/quotes/index");
    return await getQuotesBySellerUseCase(context.user.id);
  });

export const acceptQuoteServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { acceptQuoteUseCase } = await import("@/use-cases/quotes/index");
    const validated = acceptQuoteSchema.parse(data);
    return await acceptQuoteUseCase(validated.quoteId, validated.requestId);
  });
