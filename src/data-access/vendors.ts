import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/db'
import { users, sellerBrands, sellerCategories, sparePartRequests } from '@/db/schema'

/**
 * Axis Layer 1: Data Access for Seller/Vendor Management
 */

export async function getMarketPriorityMap() {
  // 1. Calculate Demand (Open Requests per Brand)
  const demandData = await db
    .select({
      brandId: sparePartRequests.brandId,
      count: sql<number>`count(*)`.mapWith(Number)
    })
    .from(sparePartRequests)
    .where(eq(sparePartRequests.status, 'open'))
    .groupBy(sparePartRequests.brandId)

  const demandMap = new Map(demandData.map(d => [d.brandId, d.count]))

  // 2. Calculate Supply (Active Sellers per Brand)
  const supplyData = await db
    .select({
      brandId: sellerBrands.brandId,
      count: sql<number>`count(distinct ${sellerBrands.sellerId})`.mapWith(Number)
    })
    .from(sellerBrands)
    .innerJoin(users, eq(sellerBrands.sellerId, users.id))
    .where(and(eq(users.role, 'seller'), eq(users.account_status, 'active')))
    .groupBy(sellerBrands.brandId)

  const supplyMap = new Map(supplyData.map(s => [s.brandId, s.count]))

  return { demandMap, supplyMap }
}

export function calculatePriorityScore(
  sellerBrands: { brandId: string }[],
  demandMap: Map<string | null, number>,
  supplyMap: Map<string | null, number>
) {
  let priorityScore = 0;
  sellerBrands.forEach(sb => {
    const brandId = sb.brandId;
    const demand = demandMap.get(brandId) || 0;
    const supply = supplyMap.get(brandId) || 0;
    priorityScore += demand / (supply + 1);
  });
  return priorityScore;
}

export async function fetchWaitlistedSellers() {
  const waitlisted = await db.query.users.findMany({
    where: eq(users.account_status, 'waitlisted'),
    with: {
      sellerBrands: {
        with: {
          brand: true
        }
      },
      sellerCategories: {
        with: {
          category: true
        }
      }
    }
  })

  const { demandMap, supplyMap } = await getMarketPriorityMap();

  const sellersWithPlus = waitlisted.map(seller => ({
    ...seller,
    priorityScore: calculatePriorityScore(seller.sellerBrands, demandMap, supplyMap)
  }));

  // Rank: Sort by Priority Score DESC, then created_at ASC
  return sellersWithPlus.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export async function updateSellerSpecialties(
  sellerId: string, 
  brandIds: string[], 
  categoryIds: string[]
) {
  return await db.transaction(async (tx) => {
    // Clear old mappings
    await tx.delete(sellerBrands).where(eq(sellerBrands.sellerId, sellerId));
    await tx.delete(sellerCategories).where(eq(sellerCategories.sellerId, sellerId));

    // Insert new mappings
    if (brandIds.length > 0) {
      await tx.insert(sellerBrands).values(
        brandIds.map(bid => ({ sellerId, brandId: bid }))
      );
    }
    
    if (categoryIds.length > 0) {
      await tx.insert(sellerCategories).values(
        categoryIds.map(cid => ({ sellerId, categoryId: cid }))
      );
    }
  });
}
