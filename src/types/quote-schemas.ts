import { z } from "zod";

export const quoteSchema = z.object({
    requestId: z.string(),
    sellerId: z.string(),
    price: z.number().positive("Price must be a positive number"),
    condition: z.enum(["new", "used"]),
    warranty: z.string().optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const acceptQuoteSchema = z.object({
    quoteId: z.string(),
    requestId: z.string(),
});

export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;
