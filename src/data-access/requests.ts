import { and, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import { partCategories, quotes, sparePartRequests, vehicleBrands } from '@/db/schema'

export async function fetchBuyerRequestsQuery(buyerId: string) {
  return await db.query.sparePartRequests.findMany({
    where: eq(sparePartRequests.buyerId, buyerId),
    orderBy: [desc(sparePartRequests.createdAt)],
    with: {
      category: true,
      brand: true,
      quotes: {
        with: {
          seller: true,
        },
      },
    },
  })
}

export async function fetchRequestDetailsQuery(requestId: string) {
  return await db.query.sparePartRequests.findFirst({
    where: eq(sparePartRequests.id, requestId),
    with: {
      category: true,
      brand: true,
      quotes: {
        with: {
          seller: true,
        },
      },
    },
  })
}

export async function fetchOpenRequestsQuery(options?: { 
  limit?: number; 
  offset?: number;
  categoryId?: string;
  brandIds?: string[];
  search?: string;
  specialtyFilter?: {
    brandIds: string[];
    categoryIds: string[];
  };
}) {
  const { limit = 20, offset = 0 } = options || {};
  
  const conditions = [eq(sparePartRequests.status, 'open')];
  
  if (options?.specialtyFilter) {
    const specialtyConditions = [];
    if (options.specialtyFilter.brandIds && options.specialtyFilter.brandIds.length > 0) {
      specialtyConditions.push(inArray(sparePartRequests.brandId, options.specialtyFilter.brandIds));
    }
    if (options.specialtyFilter.categoryIds && options.specialtyFilter.categoryIds.length > 0) {
      specialtyConditions.push(inArray(sparePartRequests.categoryId, options.specialtyFilter.categoryIds));
    }
    const specialtyCondition = specialtyConditions.length > 0 ? or(...specialtyConditions) : undefined;
    if (specialtyCondition) {
      conditions.push(specialtyCondition);
    }
  }
  
  if (options?.categoryId && options.categoryId !== 'all') {
    conditions.push(eq(sparePartRequests.categoryId, options.categoryId));
  }
  
  if (options?.brandIds && options.brandIds.length > 0) {
    conditions.push(inArray(sparePartRequests.brandId, options.brandIds));
  }
  
  if (options?.search) {
    const query = `%${options.search}%`;
    const searchCondition = or(
      ilike(sparePartRequests.partName, query),
      ilike(sparePartRequests.oemNumber, query),
      ilike(sparePartRequests.vehicleBrand, query)
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  
  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0]!;

  return await db
    .select({
      id: sparePartRequests.id,
      buyerId: sparePartRequests.buyerId,
      categoryId: sparePartRequests.categoryId,
      brandId: sparePartRequests.brandId,
      partName: sparePartRequests.partName,
      oemNumber: sparePartRequests.oemNumber,
      vehicleBrand: sparePartRequests.vehicleBrand,
      modelYear: sparePartRequests.modelYear,
      imageUrls: sparePartRequests.imageUrls,
      status: sparePartRequests.status,
      notes: sparePartRequests.notes,
      isSpam: sparePartRequests.isSpam,
      isPriority: sparePartRequests.isPriority,
      createdAt: sparePartRequests.createdAt,
      updatedAt: sparePartRequests.updatedAt,
      category: partCategories,
      brand: vehicleBrands,
      quotesCount: sql<number>`(SELECT COUNT(*)::int FROM ${quotes} WHERE ${quotes.requestId} = ${sparePartRequests.id})`,
    })
    .from(sparePartRequests)
    .leftJoin(partCategories, eq(sparePartRequests.categoryId, partCategories.id))
    .leftJoin(vehicleBrands, eq(sparePartRequests.brandId, vehicleBrands.id))
    .where(whereClause)
    .orderBy(desc(sparePartRequests.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function fetchAllRequestsQuery() {
  return await db.query.sparePartRequests.findMany({
    orderBy: [desc(sparePartRequests.createdAt)],
    with: {
      category: true,
      brand: true,
      quotes: true,
      buyer: true,
    },
  })
}

export async function insertNewRequest(data: any) {
  const newRequest = await db
    .insert(sparePartRequests)
    .values({
      buyerId: data.buyerId,
      categoryId: data.categoryId,
      brandId: data.brandId,
      partName: data.partName,
      oemNumber: data.oemNumber,
      vehicleBrand: data.vehicleBrand,
      modelYear: data.modelYear,
      notes: data.notes,
      imageUrls: data.imageUrls || [],
      status: data.status || 'open',
    })
    .returning()

  return newRequest[0]
}

export async function updateRequestStatusQuery(requestId: string, status: 'open' | 'fulfilled' | 'cancelled' | 'draft') {
  return await db
    .update(sparePartRequests)
    .set({ status })
    .where(eq(sparePartRequests.id, requestId))
    .returning()
}

export async function deleteRequestQuery(requestId: string) {
  return await db
    .delete(sparePartRequests)
    .where(eq(sparePartRequests.id, requestId))
    .returning()
}

export async function updateRequestFullQuery(requestId: string, data: any) {
  return await db
    .update(sparePartRequests)
    .set({
      categoryId: data.categoryId,
      brandId: data.brandId,
      partName: data.partName,
      oemNumber: data.oemNumber,
      vehicleBrand: data.vehicleBrand,
      modelYear: data.modelYear,
      notes: data.notes,
      imageUrls: data.imageUrls || [],
      status: data.status || 'open',
    })
    .where(eq(sparePartRequests.id, requestId))
    .returning()
}
