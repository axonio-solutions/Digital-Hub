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
  // Using explicit SQL group by to eliminate the N+1 problem (Pillar 2 fix)
  const result = await db.execute(sql`
    SELECT 
      row_to_json(u.*) as user_data,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('brandId', b.id, 'brand', jsonb_build_object('id', b.id, 'name', b.name)))
        FILTER (WHERE b.id IS NOT NULL), '[]'
      ) as "sellerBrands",
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('categoryId', c.id, 'category', jsonb_build_object('id', c.id, 'name', c.name)))
        FILTER (WHERE c.id IS NOT NULL), '[]'
      ) as "sellerCategories"
    FROM ${users} u
    LEFT JOIN ${sellerBrands} sb ON u.id = sb.seller_id
    LEFT JOIN vehicle_brands b ON sb.brand_id = b.id
    LEFT JOIN ${sellerCategories} sc ON u.id = sc.seller_id
    LEFT JOIN part_categories c ON sc.category_id = c.id
    WHERE u.account_status = 'waitlisted'
    GROUP BY u.id
  `)

  const { demandMap, supplyMap } = await getMarketPriorityMap()

  const sellersWithPlus = result.map((row: any) => {
    const rawUser = typeof row.user_data === 'string' ? JSON.parse(row.user_data) : row.user_data
    const sb = typeof row.sellerBrands === 'string' ? JSON.parse(row.sellerBrands) : row.sellerBrands
    const sc = typeof row.sellerCategories === 'string' ? JSON.parse(row.sellerCategories) : row.sellerCategories

    // Reconstruct the user object to match the frontend expected Typescript interface
    const seller = {
      ...rawUser,
      createdAt: new Date(rawUser.created_at || rawUser.createdAt || new Date()),
      accountStatus: rawUser.account_status || rawUser.accountStatus,
      sellerBrands: sb,
      sellerCategories: sc,
    }

    return {
      ...seller,
      priorityScore: calculatePriorityScore(sb, demandMap, supplyMap),
    }
  })

  // Rank: Sort by Priority Score DESC, then created_at ASC
  return sellersWithPlus.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore
    }
    return a.createdAt.getTime() - b.createdAt.getTime()
  })
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
