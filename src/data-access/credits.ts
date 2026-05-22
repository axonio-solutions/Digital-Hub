import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  creditPackages,
  creditRequests,
  creditTransactions,
  users,
} from '@/db/schema'

export async function fetchSellersWithCredits() {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      storeName: users.storeName,
      credits: users.credits,
      account_status: users.account_status,
    })
    .from(users)
    .where(eq(users.role, 'seller'))
    .orderBy(desc(users.credits))
}

export async function fetchSellerCredits(sellerId: string) {
  const result = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, sellerId))
    .then((r) => r[0])
  return result?.credits ?? 0
}

export async function grantCredits(
  sellerId: string,
  amount: number,
  type: string,
  adminId?: string,
  description?: string,
  packageId?: string,
) {
  return await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ credits: sql`${users.credits} + ${amount}` })
      .where(eq(users.id, sellerId))

    const [txn] = await tx
      .insert(creditTransactions)
      .values({
        sellerId,
        amount,
        type,
        description,
        adminId,
        packageId,
      })
      .returning()

    return txn
  })
}

export async function deductCredits(
  sellerId: string,
  amount: number,
  referenceId?: string,
) {
  return await db.transaction(async (tx) => {
    const [user] = await tx
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, sellerId))

    if (!user || user.credits < amount) {
      return { success: false, error: 'Insufficient credits' }
    }

    await tx
      .update(users)
      .set({ credits: sql`${users.credits} - ${amount}` })
      .where(eq(users.id, sellerId))

    const [txn] = await tx
      .insert(creditTransactions)
      .values({
        sellerId,
        amount: -amount,
        type: 'quote_spent',
        referenceId,
        description: `Quote submission (${referenceId})`,
      })
      .returning()

    return { success: true, transaction: txn }
  })
}

export async function fetchCreditTransactions(
  sellerId?: string,
  limit = 50,
  offset = 0,
) {
  const conditions = sellerId ? [eq(creditTransactions.sellerId, sellerId)] : []

  return await db.query.creditTransactions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: desc(creditTransactions.createdAt),
    limit,
    offset,
    with: {
      seller: {
        columns: { id: true, name: true, email: true, storeName: true },
      },
      admin: { columns: { id: true, name: true } },
    },
  })
}

export async function fetchCreditPackages() {
  return await db.query.creditPackages.findMany({
    orderBy: desc(creditPackages.createdAt),
  })
}

export async function fetchActiveCreditPackages() {
  return await db
    .select()
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))
    .orderBy(creditPackages.credits)
}

export async function createCreditPackage(data: {
  name: string
  credits: number
  price: number
  description?: string
}) {
  const [pkg] = await db.insert(creditPackages).values(data).returning()
  return pkg
}

export async function updateCreditPackage(
  id: string,
  data: Partial<{
    name: string
    credits: number
    price: number
    description: string
    isActive: boolean
  }>,
) {
  const [pkg] = await db
    .update(creditPackages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(creditPackages.id, id))
    .returning()
  return pkg
}

export async function toggleCreditPackageStatus(id: string, isActive: boolean) {
  const [pkg] = await db
    .update(creditPackages)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(creditPackages.id, id))
    .returning()
  return pkg
}

export async function fetchRevenueMetrics() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalRevenue] = await db
    .select({
      total:
        sql<number>`COALESCE(SUM(${creditTransactions.amount}), 0)`.mapWith(
          Number,
        ),
    })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.type, 'purchase'),
        gte(creditTransactions.createdAt, thirtyDaysAgo),
      ),
    )

  const [allTimeRevenue] = await db
    .select({
      total:
        sql<number>`COALESCE(SUM(${creditTransactions.amount}), 0)`.mapWith(
          Number,
        ),
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.type, 'purchase'))

  const [totalSpent] = await db
    .select({
      total:
        sql<number>`COALESCE(SUM(ABS(${creditTransactions.amount})), 0)`.mapWith(
          Number,
        ),
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.type, 'quote_spent'))

  const [activeSellersWithCredits] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.role, 'seller'),
        eq(users.account_status, 'active'),
        sql`${users.credits} > 0`,
      ),
    )

  const [totalSellers] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, 'seller'), eq(users.account_status, 'active')))

  const [newSellers] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, 'seller'), gte(users.createdAt, thirtyDaysAgo)))

  const [totalPackages] = await db
    .select({ count: count() })
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))

  return {
    monthlyRevenue: Number(totalRevenue.total),
    allTimeRevenue: Number(allTimeRevenue.total),
    totalCreditsSpent: Number(totalSpent.total),
    activeSellersWithCredits: Number(activeSellersWithCredits?.count ?? 0),
    totalActiveSellers: Number(totalSellers?.count ?? 0),
    newSellersThisMonth: Number(newSellers?.count ?? 0),
    totalPackages: Number(totalPackages?.count ?? 0),
  }
}

// --- Credit Requests ---

export async function createCreditRequest(
  sellerId: string,
  credits: number,
  packageId?: string,
) {
  const [req] = await db
    .insert(creditRequests)
    .values({ sellerId, credits, packageId })
    .returning()
  return req
}

export async function fetchCreditRequests(status?: string) {
  const conditions = status ? [eq(creditRequests.status, status)] : []
  return await db.query.creditRequests.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: desc(creditRequests.createdAt),
    with: {
      seller: {
        columns: { id: true, name: true, email: true, storeName: true },
      },
      package: true,
      admin: { columns: { id: true, name: true } },
    },
  })
}

export async function updateCreditRequestStatus(
  id: string,
  status: string,
  adminId: string,
  adminNote?: string,
) {
  const [req] = await db
    .update(creditRequests)
    .set({ status, adminId, adminNote, updatedAt: new Date() })
    .where(eq(creditRequests.id, id))
    .returning()
  return req
}

export async function fetchPendingCreditRequestsCount() {
  const [result] = await db
    .select({ count: count() })
    .from(creditRequests)
    .where(eq(creditRequests.status, 'pending'))
  return Number(result?.count ?? 0)
}
