import { db } from "@/db";
import { quotes, sparePartRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function insertQuote(data: any) {
  return await db.insert(quotes).values({
    requestId: data.requestId,
    sellerId: data.sellerId,
    price: data.price,
    condition: data.condition,
    warranty: data.warranty,
    status: 'pending',
  }).returning();
}

export async function getRequestById(requestId: string) {
  return await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, requestId)
  });
}

export async function acceptQuoteTransaction(quoteId: string, requestId: string) {
  await db.transaction(async (tx) => {
    await tx.update(quotes)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(quotes.id, quoteId));

    await tx.update(sparePartRequests)
      .set({ status: 'fulfilled', updatedAt: new Date() })
      .where(eq(sparePartRequests.id, requestId));
  });
}

export async function fetchSellerQuotes(sellerId: string) {
  return await db.query.quotes.findMany({
      where: eq(quotes.sellerId, sellerId),
      orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
      with: {
          request: true
      }
  });
}
