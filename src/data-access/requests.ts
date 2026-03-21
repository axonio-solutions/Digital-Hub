import { db } from "@/db";
import { sparePartRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function fetchBuyerRequestsQuery(buyerId: string) {
  return await db.query.sparePartRequests.findMany({
    where: eq(sparePartRequests.buyerId, buyerId),
    orderBy: [desc(sparePartRequests.createdAt)],
    with: {
      quotes: {
        with: {
          seller: true
        }
      }
    }
  });
}

export async function fetchOpenRequestsQuery() {
  return await db.query.sparePartRequests.findMany({
     where: eq(sparePartRequests.status, 'open'),
     orderBy: [desc(sparePartRequests.createdAt)],
     with: {
       quotes: true 
     }
  });
}

export async function fetchAllRequestsQuery() {
  return await db.query.sparePartRequests.findMany({
     orderBy: [desc(sparePartRequests.createdAt)],
     with: {
       quotes: true 
     }
  });
}

export async function insertNewRequest(data: any) {
  const newRequest = await db.insert(sparePartRequests).values({
    buyerId: data.buyerId,
    partName: data.partName,
    oemNumber: data.oemNumber,
    vehicleBrand: data.vehicleBrand,
    modelYear: data.modelYear,
    notes: data.notes,
    imageUrls: data.imageUrls || [],
    status: 'open',
  }).returning();

  return newRequest[0];
}
