import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { creditRequests, users } from '@/db/schema'
import {
  createCreditPackage,
  createCreditRequest,
  deductCredits,
  fetchActiveCreditPackages,
  fetchCreditPackages,
  fetchCreditRequests,
  fetchCreditTransactions,
  fetchPendingCreditRequestsCount,
  fetchRevenueMetrics,
  fetchSellerCredits,
  fetchSellersWithCredits,
  grantCredits,
  toggleCreditPackageStatus,
  updateCreditPackage,
} from '@/data-access/credits'

export async function getSellersWithCreditsUseCase() {
  return await fetchSellersWithCredits()
}

export async function getSellerCreditsUseCase(sellerId: string) {
  return await fetchSellerCredits(sellerId)
}

export async function grantCreditsUseCase(
  sellerId: string,
  amount: number,
  adminId: string,
  description?: string,
  packageId?: string,
) {
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' }
  }
  const txn = await grantCredits(
    sellerId,
    amount,
    'purchase',
    adminId,
    description,
    packageId,
  )
  return { success: true, transaction: txn }
}

export async function getCreditTransactionsUseCase(sellerId?: string) {
  return await fetchCreditTransactions(sellerId, 100, 0)
}

export async function getCreditPackagesUseCase() {
  return await fetchCreditPackages()
}

export async function getActiveCreditPackagesUseCase() {
  return await fetchActiveCreditPackages()
}

export async function createCreditPackageUseCase(data: {
  name: string
  credits: number
  price: number
  description?: string
}) {
  return await createCreditPackage(data)
}

export async function updateCreditPackageUseCase(
  id: string,
  data: Partial<{
    name: string
    credits: number
    price: number
    description: string
    isActive: boolean
  }>,
) {
  return await updateCreditPackage(id, data)
}

export async function toggleCreditPackageStatusUseCase(
  id: string,
  isActive: boolean,
) {
  return await toggleCreditPackageStatus(id, isActive)
}

export async function getRevenueMetricsUseCase() {
  return await fetchRevenueMetrics()
}

export async function deductCreditForQuoteUseCase(
  sellerId: string,
  quoteId: string,
) {
  return await deductCredits(sellerId, 1, quoteId)
}

export async function requestCreditsUseCase(
  sellerId: string,
  credits: number,
  packageId?: string,
) {
  if (credits <= 0) {
    return { success: false, error: 'Credit amount must be positive' }
  }
  const req = await createCreditRequest(sellerId, credits, packageId)

  const seller = await db.query.users.findFirst({
    where: eq(users.id, sellerId),
    columns: { name: true },
  })
  const { NotificationTriggers } =
    await import('@/services/notification-triggers')
  NotificationTriggers.onCreditRequestSubmitted(
    sellerId,
    seller?.name ?? 'A seller',
    credits,
  ).catch(console.error)

  return { success: true, data: req }
}

export async function getCreditRequestsUseCase(status?: string) {
  return await fetchCreditRequests(status)
}

export async function approveCreditRequestUseCase(
  id: string,
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    const updated = await tx
      .update(creditRequests)
      .set({ status: 'approved', adminId, updatedAt: new Date() })
      .where(
        and(eq(creditRequests.id, id), eq(creditRequests.status, 'pending')),
      )
      .returning()

    if (updated.length === 0)
      return { success: false, error: 'Request not found or already processed' }

    const req = updated[0]
    await grantCredits(
      req.sellerId,
      req.credits,
      'credit_request_approved',
      adminId,
      `Credit request approved — ${req.credits} credits`,
    )

    const { NotificationTriggers } =
      await import('@/services/notification-triggers')
    NotificationTriggers.onCreditRequestApproved(
      req.sellerId,
      req.credits,
    ).catch(console.error)

    return { success: true }
  })
}

export async function rejectCreditRequestUseCase(
  id: string,
  adminId: string,
  adminNote?: string,
) {
  const [updated] = await db
    .update(creditRequests)
    .set({ status: 'rejected', adminId, adminNote, updatedAt: new Date() })
    .where(eq(creditRequests.id, id))
    .returning()

  if (updated) {
    const { NotificationTriggers } =
      await import('@/services/notification-triggers')
    NotificationTriggers.onCreditRequestRejected(
      updated.sellerId,
      updated.credits,
      adminNote,
    ).catch(console.error)
  }

  return updated
}

export async function getPendingCreditRequestsCountUseCase() {
  return await fetchPendingCreditRequestsCount()
}
