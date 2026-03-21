import { insertQuote, getRequestById, fetchSellerQuotes, acceptQuoteTransaction } from "@/data-access/quotes";
import { insertNotification } from "@/data-access/notifications";
import { type QuoteInput } from "@/types/quote-schemas";

/**
 * Axis Layer 4: Use Cases for Quotes
 */

export async function createQuoteUseCase(data: QuoteInput) {
    try {
        const newQuote = await insertQuote(data);
        const request = await getRequestById(data.requestId);

        if (request) {
            // Dispatch Notification
            await insertNotification({
                userId: request.buyerId,
                title: "New Quote Received!",
                message: `A seller just offered ${data.price} DZD for your ${request.partName}.`,
                type: "new_quote",
                linkUrl: `/dashboard`
            });
        }

        return { success: true, data: newQuote[0] };
    } catch (error) {
        console.error("Error in createQuoteUseCase:", error);
        return { success: false, error: "Failed to create quote" };
    }
}

export async function acceptQuoteUseCase(quoteId: string, requestId: string) {
    try {
        const result = await acceptQuoteTransaction(quoteId, requestId);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in acceptQuoteUseCase:", error);
        return { success: false, error: "Failed to accept quote" };
    }
}

export async function getQuotesBySellerUseCase(sellerId: string) {
    try {
        const quotes = await fetchSellerQuotes(sellerId);
        return { success: true, data: quotes };
    } catch (error) {
        console.error("Error in getQuotesBySellerUseCase:", error);
        return { success: false, error: "Failed to fetch quotes" };
    }
}
